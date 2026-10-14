import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import {
  PrismaClient,
  ResidentType,
} from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function printHelp() {
  console.log(`
🏠 Script para trasladar un residente a otra casa en Condofy

Uso:
  npm run move:resident [email_o_userId] [nombre_o_numero_casa] [opciones]
  npx tsx scripts/move-resident.ts [email_o_userId] [nombre_o_numero_casa] [opciones]

Argumentos posicionales:
  email_o_userId        Correo electrónico o UUID del residente a cambiar.
  nombre_o_numero_casa  Número o identificador de la casa destino (ej: 102, Casa 4, A-201 o UUID).

Opciones:
  --email <valor>       Correo del residente
  --house <valor>       Número o nombre de la casa destino
  --condo <valor>       ID, clave (slug) o nombre del condominio (útil si se cambia de condominio)
  --role, --type <val>  Nuevo tipo de residente: PRIMARY, TENANT o FAMILY_MEMBER (por defecto conserva el actual)
  --with-family         Mover también a los familiares / co-residentes de la vivienda actual
  --only-resident       Mover únicamente al residente principal indicado
  --move-visitors       Transferir los visitantes registrados en la casa origen hacia la nueva casa
  --keep-visitors       Mantener los visitantes en la casa origen
  --revoke-sessions     Cerrar sesiones activas del usuario para forzar actualización (por defecto: activado)
  --dry-run             Simula la operación sin realizar cambios en la base de datos
  --yes, -y             Modo no interactivo (omite preguntas de confirmación)
  --help, -h            Muestra este mensaje de ayuda

Ejemplos:
  npm run move:resident juan@ejemplo.com 102
  npm run move:resident maria@ejemplo.com "Torre B - 304" --with-family --move-visitors
  npm run move:resident carlos@ejemplo.com 205 --dry-run
  npm run move:resident carlos@ejemplo.com 205 --role TENANT --yes
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const isYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');
  const withFamilyFlag = args.includes('--with-family');
  const onlyResidentFlag = args.includes('--only-resident');
  const moveVisitorsFlag = args.includes('--move-visitors');
  const keepVisitorsFlag = args.includes('--keep-visitors');

  const getArgVal = (names: string[]): string | null => {
    for (const name of names) {
      const idx = args.indexOf(name);
      if (
        idx !== -1 &&
        idx + 1 < args.length &&
        !args[idx + 1].startsWith('-')
      ) {
        return args[idx + 1];
      }
      const prefix = `${name}=`;
      const found = args.find((a) => a.startsWith(prefix));
      if (found) return found.slice(prefix.length);
    }
    return null;
  };

  const flagEmail = getArgVal(['--email', '-e']);
  const flagHouse = getArgVal(['--house']);
  const flagCondo = getArgVal(['--condo', '--condominium']);
  const flagRole = getArgVal(['--role', '--type']);

  const positionalArgs = args.filter(
    (a) =>
      !a.startsWith('-') &&
      a !== flagEmail &&
      a !== flagHouse &&
      a !== flagCondo &&
      a !== flagRole,
  );

  let emailInput = flagEmail || positionalArgs[0] || null;
  let targetHouseInput = flagHouse || positionalArgs[1] || null;
  let condoInput = flagCondo;

  const rl = readline.createInterface({ input, output });

  try {
    // Si no se proporcionó el correo, solicitarlo interactivamente
    if (!emailInput) {
      const resp = await rl.question(
        '📧 Ingresa el correo o ID del residente a cambiar de casa: ',
      );
      emailInput = resp.trim();
    }

    if (!emailInput) {
      console.error('❌ Error: Debes ingresar el correo o ID del residente.');
      process.exit(1);
    }

    // Si no se proporcionó la casa destino, solicitarla interactivamente
    if (!targetHouseInput) {
      const resp = await rl.question(
        '🏠 Ingresa el número/nombre de la nueva casa (ej: 102, Casa 4): ',
      );
      targetHouseInput = resp.trim();
    }

    if (!targetHouseInput) {
      console.error(
        '❌ Error: Debes ingresar el identificador o número de la casa destino.',
      );
      process.exit(1);
    }

    console.log(`\n🔍 Buscando residente: "${emailInput}"...`);

    // 1. Buscar usuario y perfil de residente
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: emailInput, mode: 'insensitive' } },
          ...(UUID_REGEX.test(emailInput) ? [{ id: emailInput }] : []),
        ],
      },
      include: {
        residentProfile: {
          include: {
            house: {
              include: {
                condominium: true,
              },
            },
            condominium: true,
          },
        },
      },
    });

    if (!user) {
      console.error(`❌ No se encontró ningún usuario con: "${emailInput}"`);
      process.exit(1);
    }

    if (!user.residentProfile) {
      console.error(
        `❌ El usuario ${user.email} (Rol: ${user.role}) no cuenta con un perfil de residente activo.`,
      );
      process.exit(1);
    }

    const currentResident = user.residentProfile;
    const currentHouse = currentResident.house;

    if (!currentHouse) {
      console.error(
        `❌ El perfil del residente no tiene una casa actual asignada.`,
      );
      process.exit(1);
    }

    console.log(
      `👤 Residente encontrado: ${currentResident.firstName} ${currentResident.lastName} (${user.email})`,
    );
    console.log(
      `   - ID de usuario: ${user.id} | Perfil ID: ${currentResident.id}`,
    );
    console.log(`   - Tipo actual: ${currentResident.residentType}`);
    console.log(
      `   - Casa actual: ${currentHouse.houseNumber}${currentHouse.tower ? ` (Torre: ${currentHouse.tower})` : ''} (ID: ${currentHouse.id})`,
    );
    console.log(
      `   - Condominio actual: ${currentHouse.condominium?.name ?? currentResident.condominiumId} (ID: ${currentResident.condominiumId})`,
    );

    // 2. Determinar condominio para la búsqueda de la casa destino
    let targetCondoId = currentResident.condominiumId;

    if (condoInput) {
      const condoFound = await prisma.condominium.findFirst({
        where: {
          OR: [
            { id: condoInput },
            { key: condoInput },
            { name: { equals: condoInput, mode: 'insensitive' } },
          ],
        },
      });

      if (!condoFound) {
        console.error(
          `❌ No se encontró el condominio especificado: "${condoInput}"`,
        );
        process.exit(1);
      }
      targetCondoId = condoFound.id;
      console.log(
        `🏢 Condominio destino seleccionado: "${condoFound.name}" (ID: ${condoFound.id})`,
      );
    }

    // 3. Buscar casa destino
    console.log(`\n🔍 Buscando casa destino: "${targetHouseInput}"...`);

    let targetHouse = null;

    // A) Búsqueda directa por UUID si aplica
    if (UUID_REGEX.test(targetHouseInput)) {
      targetHouse = await prisma.house.findUnique({
        where: { id: targetHouseInput },
        include: {
          condominium: true,
          residents: {
            include: { user: true },
          },
        },
      });
    }

    // B) Búsqueda por número de casa en el condominio objetivo
    if (!targetHouse) {
      const variations = [
        targetHouseInput,
        targetHouseInput.replace(/^casa\s+/i, '').trim(),
        `Casa ${targetHouseInput.trim()}`,
      ].filter((v, i, arr) => arr.indexOf(v) === i);

      for (const val of variations) {
        targetHouse = await prisma.house.findFirst({
          where: {
            condominiumId: targetCondoId,
            houseNumber: { equals: val, mode: 'insensitive' },
          },
          include: {
            condominium: true,
            residents: {
              include: { user: true },
            },
          },
        });
        if (targetHouse) break;
      }
    }

    // C) Si no se encontró en el condominio actual y no se especificó --condo, buscar en otros condominios
    if (!targetHouse && !condoInput) {
      const matchingHouses = await prisma.house.findMany({
        where: {
          houseNumber: { equals: targetHouseInput, mode: 'insensitive' },
        },
        include: {
          condominium: true,
          residents: {
            include: { user: true },
          },
        },
      });

      if (matchingHouses.length === 1) {
        targetHouse = matchingHouses[0];
        console.log(
          `ℹ️ Casa encontrada en otro condominio: "${targetHouse.condominium.name}"`,
        );
      } else if (matchingHouses.length > 1) {
        console.error(
          `❌ Se encontraron múltiples casas con el número "${targetHouseInput}" en diferentes condominios:`,
        );
        matchingHouses.forEach((h) => {
          console.error(
            `   - Casa ${h.houseNumber} en "${h.condominium.name}" (condominio ID / key: ${h.condominium.key || h.condominium.id})`,
          );
        });
        console.error(
          `Por favor utiliza la opción --condo <clave_o_id> para especificar a cuál condominio pertenece.`,
        );
        process.exit(1);
      }
    }

    if (!targetHouse) {
      console.error(
        `❌ No se encontró ninguna casa con el identificador/número: "${targetHouseInput}"`,
      );
      process.exit(1);
    }

    if (targetHouse.id === currentHouse.id) {
      console.log(
        `\n⚠️  El residente ya se encuentra asignado a la casa ${targetHouse.houseNumber}.`,
      );
      console.log('No es necesario realizar ningún cambio.');
      process.exit(0);
    }

    if (targetHouse.isDisabled) {
      console.warn(
        `\n⚠️  AVISO: La casa destino "${targetHouse.houseNumber}" se encuentra actualmente deshabilitada (isDisabled = true).`,
      );
    }

    console.log(
      `🏡 Casa destino encontrada: ${targetHouse.houseNumber}${targetHouse.tower ? ` (Torre: ${targetHouse.tower})` : ''} (ID: ${targetHouse.id})`,
    );
    console.log(
      `   - Condominio: ${targetHouse.condominium?.name ?? targetHouse.condominiumId}`,
    );

    // Residentes actuales en la casa destino
    const targetResidents = targetHouse.residents || [];
    if (targetResidents.length > 0) {
      console.log(
        `   - Residentes existentes en la nueva casa (${targetResidents.length}):`,
      );
      targetResidents.forEach((tr) => {
        console.log(
          `     • ${tr.firstName} ${tr.lastName} (${tr.user?.email}) [Tipo: ${tr.residentType}]`,
        );
      });
    } else {
      console.log(`   - La casa destino no tiene residentes actualmente.`);
    }

    // 4. Validar o ajustar tipo de residente (PRIMARY, TENANT, FAMILY_MEMBER)
    let newResidentType: ResidentType = currentResident.residentType;
    if (flagRole) {
      const normalizedRole = flagRole.toUpperCase();
      if (
        normalizedRole === 'PRIMARY' ||
        normalizedRole === 'TENANT' ||
        normalizedRole === 'FAMILY_MEMBER'
      ) {
        newResidentType = normalizedRole as ResidentType;
      } else {
        console.error(
          `❌ Rol no válido: "${flagRole}". Debe ser PRIMARY, TENANT o FAMILY_MEMBER.`,
        );
        process.exit(1);
      }
    }

    // 5. Detectar otros miembros en la casa de origen (familiares / co-residentes)
    const otherOriginResidents = await prisma.residentProfile.findMany({
      where: {
        houseId: currentHouse.id,
        userId: { not: user.id },
      },
      include: { user: true },
    });

    let moveFamily = withFamilyFlag;
    if (
      otherOriginResidents.length > 0 &&
      !withFamilyFlag &&
      !onlyResidentFlag
    ) {
      console.log(
        `\n👥 Se detectaron otros residentes (${otherOriginResidents.length}) en la casa de origen:`,
      );
      otherOriginResidents.forEach((r) => {
        console.log(
          `   • ${r.firstName} ${r.lastName} (${r.user?.email}) [Tipo: ${r.residentType}]`,
        );
      });

      if (!isYes) {
        const resp = await rl.question(
          `\n¿Deseas trasladar también a estos ${otherOriginResidents.length} residente(s) a la nueva casa? (s/N): `,
        );
        moveFamily = ['s', 'si', 'y', 'yes'].includes(
          resp.trim().toLowerCase(),
        );
      }
    }

    const residentsToMove = [
      currentResident,
      ...(moveFamily ? otherOriginResidents : []),
    ];

    // 6. Detectar visitantes de la casa de origen
    const originVisitors = await prisma.visitor.findMany({
      where: { houseId: currentHouse.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        category: true,
      },
    });

    let moveVisitors = moveVisitorsFlag;
    if (originVisitors.length > 0 && !moveVisitorsFlag && !keepVisitorsFlag) {
      console.log(
        `\n🚗 La casa de origen tiene ${originVisitors.length} visitante(s) registrado(s).`,
      );
      if (!isYes) {
        const resp = await rl.question(
          `¿Deseas transferir estos visitantes a la nueva casa ${targetHouse.houseNumber}? (s/N): `,
        );
        moveVisitors = ['s', 'si', 'y', 'yes'].includes(
          resp.trim().toLowerCase(),
        );
      }
    }

    // 7. Paquetería pendiente en la casa de origen (informativo)
    const pendingParcels = await prisma.parcelDelivery.count({
      where: {
        houseId: currentHouse.id,
        status: 'IN_CUSTODY',
      },
    });
    if (pendingParcels > 0) {
      console.log(
        `\n📦 AVISO: Hay ${pendingParcels} paquete(s) con estatus "EN CUSTODIA" para la casa origen ${currentHouse.houseNumber}.`,
      );
    }

    // 8. Resumen de la operación antes de confirmar
    console.log('\n' + '='.repeat(60));
    console.log('📋 RESUMEN DE LA OPERACIÓN:');
    console.log('='.repeat(60));
    console.log(
      `👤 Residente principal : ${user.email} (${currentResident.firstName} ${currentResident.lastName})`,
    );
    console.log(
      `   - Tipo de residente : ${currentResident.residentType} ➔ ${newResidentType}`,
    );
    console.log(
      `🏠 Casa origen         : ${currentHouse.houseNumber}${currentHouse.tower ? ` (${currentHouse.tower})` : ''} [${currentHouse.condominium?.name}]`,
    );
    console.log(
      `🏡 Casa destino        : ${targetHouse.houseNumber}${targetHouse.tower ? ` (${targetHouse.tower})` : ''} [${targetHouse.condominium?.name}]`,
    );
    console.log(
      `👥 Total residentes a trasladar : ${residentsToMove.length} ${moveFamily ? '(Incluye familiares/co-residentes)' : '(Solo el residente especificado)'}`,
    );
    if (residentsToMove.length > 1) {
      residentsToMove.forEach((r) => {
        console.log(`     • ${r.firstName} ${r.lastName} (${r.user?.email})`);
      });
    }
    console.log(
      `🚗 Visitantes a transferir      : ${moveVisitors ? `${originVisitors.length} visitantes` : '0 (permanecen en casa origen)'}`,
    );
    console.log(
      `🔐 Sesiones activas            : Serán revocadas para forzar recarga de sesión en la app`,
    );
    console.log('='.repeat(60));

    if (isDryRun) {
      console.log(
        '\n🧪 MODO SIMULACIÓN (--dry-run): No se realizaron cambios en la base de datos.',
      );
      process.exit(0);
    }

    // Confirmación interactiva si no se usó --yes
    if (!isYes) {
      const confirm = await rl.question(
        '\n¿Confirmas que deseas proceder con el traslado? Escribe "SI" para confirmar: ',
      );
      if (confirm.trim().toUpperCase() !== 'SI') {
        console.log('🛑 Operación cancelada por el usuario.');
        process.exit(0);
      }
    }

    console.log('\n⏳ Ejecutando traslado en base de datos...');

    const userIdsToRevoke = residentsToMove
      .map((r) => r.userId)
      .filter((id): id is string => Boolean(id));

    await prisma.$transaction(async (tx) => {
      // 1. Actualizar perfil del residente principal
      await tx.residentProfile.update({
        where: { id: currentResident.id },
        data: {
          houseId: targetHouse.id,
          condominiumId: targetHouse.condominiumId,
          residentType: newResidentType,
          updatedAt: new Date(),
        },
      });

      // Actualizar usuario principal (condominiumId)
      await tx.user.update({
        where: { id: user.id },
        data: {
          condominiumId: targetHouse.condominiumId,
          updatedAt: new Date(),
        },
      });

      // 2. Si se trasladan familiares / co-residentes
      if (moveFamily && otherOriginResidents.length > 0) {
        for (const fam of otherOriginResidents) {
          await tx.residentProfile.update({
            where: { id: fam.id },
            data: {
              houseId: targetHouse.id,
              condominiumId: targetHouse.condominiumId,
              updatedAt: new Date(),
            },
          });

          if (fam.userId) {
            await tx.user.update({
              where: { id: fam.userId },
              data: {
                condominiumId: targetHouse.condominiumId,
                updatedAt: new Date(),
              },
            });
          }
        }
      }

      // 3. Transferir visitantes si se solicitó
      if (moveVisitors && originVisitors.length > 0) {
        const updateVisResult = await tx.visitor.updateMany({
          where: { houseId: currentHouse.id },
          data: { houseId: targetHouse.id },
        });
        console.log(
          `   ✓ ${updateVisResult.count} visitante(s) transferido(s) a la nueva casa.`,
        );
      }

      // 4. Actualizar lecturas de comunicados para apuntar a la nueva casa
      if (userIdsToRevoke.length > 0) {
        await tx.announcementReader.updateMany({
          where: {
            userId: { in: userIdsToRevoke },
            houseId: currentHouse.id,
          },
          data: {
            houseId: targetHouse.id,
          },
        });
      }

      // 5. Revocar sesiones activas de los usuarios trasladados para forzar renovación de token
      if (userIdsToRevoke.length > 0) {
        const revoked = await tx.userSession.updateMany({
          where: {
            userId: { in: userIdsToRevoke },
            isRevoked: false,
          },
          data: {
            isRevoked: true,
          },
        });
        console.log(
          `   ✓ ${revoked.count} sesión(es) activa(s) invalidada(s) para forzar sincronización.`,
        );
      }
    });

    console.log('\n✅ ¡Residente trasladado con éxito a la nueva casa!');
    console.log(
      `   De: Casa ${currentHouse.houseNumber} ➔ A: Casa ${targetHouse.houseNumber} (${targetHouse.condominium?.name})\n`,
    );
  } catch (error: any) {
    console.error('\n❌ Error al ejecutar el traslado del residente:');
    console.error(error?.message || error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
