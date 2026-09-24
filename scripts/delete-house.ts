import 'dotenv/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { PrismaClient } from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Inicialización de cliente Cloudflare R2 / S3
const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
const region = process.env.STORAGE_REGION || 'auto';
const bucketName = process.env.STORAGE_BUCKET_NAME || 'condofy-storage';

let s3Client: S3Client | null = null;
if (endpoint && accessKeyId && secretAccessKey) {
  s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

function cleanStorageKey(rawUrlOrKey: string): string {
  if (!rawUrlOrKey) return '';
  let key = rawUrlOrKey.trim();
  if (key.startsWith('http://') || key.startsWith('https://')) {
    try {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
      if (bucketName && key.startsWith(`${bucketName}/`)) {
        key = key.replace(`${bucketName}/`, '');
      }
    } catch {
      // Ignorar error de parsing y usar como string directo
    }
  }
  return key;
}

async function deleteFromR2(key: string): Promise<boolean> {
  if (!key) return false;
  const cleanedKey = cleanStorageKey(key);

  if (!s3Client) {
    console.log(
      `   [R2 SIMULACIÓN] Archivo omitido (sin credenciales R2 configuradas): ${cleanedKey}`,
    );
    return true;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cleanedKey,
    });
    await s3Client.send(command);
    return true;
  } catch (err: any) {
    console.warn(
      `   ⚠️  No se pudo eliminar de R2 (${cleanedKey}): ${err.message}`,
    );
    return false;
  }
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso:
  yarn delete:house [condominio] [casa] [opciones]
  yarn delete:house [houseId] [opciones]

Argumentos:
  condominio   Clave (ej: albero), ID o nombre del condominio
  casa         Número de la casa (ej: 102, B-12)
  houseId      UUID directo de la vivienda

Opciones:
  --condo, --condominium <val>   Especifica el condominio directamente
  --house <val>                  Especifica el número de casa
  --id <val>                     Especifica el ID (UUID) de la casa
  --dry-run                      Modo simulación (lista dependencias y archivos sin borrar)
  --yes, -y                      Modo desatendido (omite confirmación interactiva 'SI')
  --help, -h                     Muestra esta ayuda

Ejemplos:
  yarn delete:house albero 102
  yarn delete:house --condo albero --house 102
  yarn delete:house 7b25e1fc-99f2-4bc2-8f92-563ea9e43f11
  yarn delete:house albero 102 --dry-run
  yarn delete:house albero 102 --yes
`);
    process.exit(0);
  }

  const isYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');

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

  let flagCondo = getArgVal(['--condo', '--condominium']);
  let flagHouse = getArgVal(['--house']);
  let flagId = getArgVal(['--id']);

  const positionalArgs = args.filter(
    (a) =>
      !a.startsWith('-') && a !== flagCondo && a !== flagHouse && a !== flagId,
  );

  let houseIdInput = flagId;
  let condoInput = flagCondo;
  let houseNumberInput = flagHouse;

  // Si se pasó un solo argumento posicional y parece UUID
  if (
    !houseIdInput &&
    positionalArgs.length === 1 &&
    UUID_REGEX.test(positionalArgs[0])
  ) {
    houseIdInput = positionalArgs[0];
  } else if (!houseIdInput && positionalArgs.length >= 2) {
    if (!condoInput) condoInput = positionalArgs[0];
    if (!houseNumberInput) houseNumberInput = positionalArgs[1];
  } else if (!houseIdInput && positionalArgs.length === 1 && !condoInput) {
    condoInput = positionalArgs[0];
  }

  const initialHouseProvided = !!houseNumberInput;
  const rl = readline.createInterface({ input, output });

  try {
    const condominiums = await prisma.condominium.findMany({
      select: { id: true, name: true, key: true },
      orderBy: { name: 'asc' },
    });

    if (condominiums.length === 0) {
      console.error(
        '❌ No se encontraron condominios registrados en la base de datos.',
      );
      process.exit(1);
    }

    let targetHouse: any = null;

    // Si se especificó houseId directo
    if (houseIdInput) {
      console.log(`\n🔍 Buscando casa por ID: ${houseIdInput}...`);
      targetHouse = await prisma.house.findUnique({
        where: { id: houseIdInput },
        include: {
          condominium: true,
          residents: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!targetHouse) {
        console.error(`❌ No se encontró ninguna casa con ID: ${houseIdInput}`);
        process.exit(1);
      }
    } else {
      // 1. Resolver el condominio
      let selectedCondo: { id: string; name: string; key: string } | null =
        null;

      if (condoInput) {
        const q = condoInput.trim().toLowerCase();
        selectedCondo =
          condominiums.find((c) => c.id.toLowerCase() === q) ||
          condominiums.find((c) => c.key.toLowerCase() === q) ||
          condominiums.find((c) => c.name.toLowerCase() === q) ||
          condominiums.find((c) => c.key.toLowerCase().includes(q)) ||
          condominiums.find((c) => c.name.toLowerCase().includes(q)) ||
          null;

        if (!selectedCondo) {
          console.warn(
            `⚠️  No se encontró coincidencia exacta para condominio: "${condoInput}".`,
          );
        }
      }

      // Si no hay condominio seleccionado, solicitar interactivamente
      while (!selectedCondo) {
        console.log('\n🏢 CONDOMINIOS DISPONIBLES:');
        condominiums.forEach((c, idx) => {
          console.log(
            `  [${idx + 1}] ${c.name} (Clave: ${c.key} | ID: ${c.id})`,
          );
        });

        const promptText =
          condominiums.length === 1
            ? `\n👉 Selecciona el condominio [1]: `
            : `\n👉 Selecciona el número (1-${condominiums.length}) o escribe la clave [1]: `;

        const ans = (await rl.question(promptText)).trim();
        if (!ans || ans === '1') {
          selectedCondo = condominiums[0];
        } else {
          const idx = parseInt(ans, 10) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < condominiums.length) {
            selectedCondo = condominiums[idx];
          } else {
            const found =
              condominiums.find(
                (c) => c.key.toLowerCase() === ans.toLowerCase(),
              ) ||
              condominiums.find((c) =>
                c.name.toLowerCase().includes(ans.toLowerCase()),
              ) ||
              condominiums.find(
                (c) => c.id.toLowerCase() === ans.toLowerCase(),
              );
            if (found) {
              selectedCondo = found;
            } else {
              console.log('⚠️  Opción no válida. Intenta de nuevo.');
            }
          }
        }
      }

      // 2. Resolver la vivienda dentro del condominio
      while (!targetHouse) {
        if (!houseNumberInput) {
          houseNumberInput = (
            await rl.question(
              `\n🔢 Ingresa el número de la casa en "${selectedCondo.name}" (ej: 38, Casa 38, B-10) o su UUID: `,
            )
          ).trim();
        }

        if (!houseNumberInput) {
          console.log('⚠️  Debes ingresar un número o ID de vivienda.');
          continue;
        }

        console.log(
          `\n🔍 Buscando casa "${houseNumberInput}" en "${selectedCondo.name}"...`,
        );

        const cleanInput = houseNumberInput.trim();
        const searchVariations = [
          cleanInput,
          `Casa ${cleanInput}`,
          `casa ${cleanInput}`,
          cleanInput.replace(/^casa\s+/i, '').trim(),
        ].filter(Boolean);

        // Búsqueda exacta y por variaciones habituales ("38" vs "Casa 38")
        targetHouse = await prisma.house.findFirst({
          where: {
            condominiumId: selectedCondo.id,
            OR: [
              ...searchVariations.map((v) => ({
                houseNumber: { equals: v, mode: 'insensitive' as const },
              })),
            ],
          },
          include: {
            condominium: true,
            residents: {
              include: {
                user: true,
              },
            },
          },
        });

        // Búsqueda por UUID o coincidencia parcial si aún no se encuentra
        if (!targetHouse) {
          targetHouse = await prisma.house.findFirst({
            where: {
              condominiumId: selectedCondo.id,
              OR: [
                { id: cleanInput },
                { houseNumber: { contains: cleanInput, mode: 'insensitive' } },
              ],
            },
            include: {
              condominium: true,
              residents: {
                include: {
                  user: true,
                },
              },
            },
          });
        }

        if (!targetHouse) {
          console.error(
            `❌ No se encontró ninguna casa que coincida con "${houseNumberInput}" en ${selectedCondo.name}.`,
          );
          // Si el argumento vino directo de CLI o estamos en modo no interactivo (--yes), salir de inmediato
          if (initialHouseProvided || isYes) {
            process.exit(1);
          }
          houseNumberInput = null; // Reiniciar para volver a preguntar en el loop
        }
      }
    }

    const houseId = targetHouse.id;
    const condo = targetHouse.condominium;

    console.log('\n======================================================');
    console.log('             DATOS DE LA VIVIENDA A ELIMINAR          ');
    console.log('======================================================');
    console.log(
      `🏢 Condominio : ${condo.name} (Key: ${condo.key} | ID: ${condo.id})`,
    );
    console.log(
      `🏠 Casa       : ${targetHouse.houseNumber} ${targetHouse.tower ? `(Torre: ${targetHouse.tower})` : ''}`,
    );
    console.log(`🆔 ID Casa    : ${targetHouse.id}`);
    console.log(
      `📅 Creada     : ${targetHouse.createdAt.toLocaleString('es-MX')}`,
    );
    console.log(
      `🔒 Estatus    : ${targetHouse.isDisabled ? 'Deshabilitada' : 'Activa'}`,
    );

    // 2. Investigar todas las relaciones de la casa
    console.log('\n🔎 Analizando registros y relaciones asociadas...');

    // A. Residentes vinculados
    const residentProfiles = await prisma.residentProfile.findMany({
      where: { houseId },
      include: { user: true },
    });

    const residentUserIds: string[] = [];
    const usersToDelete: {
      id: string;
      email: string;
      role: string;
      name: string;
    }[] = [];
    const usersToUnlinkOnly: {
      id: string;
      email: string;
      role: string;
      reason: string;
    }[] = [];

    for (const rp of residentProfiles) {
      if (rp.userId) {
        residentUserIds.push(rp.userId);
        const u = rp.user;

        // Comprobar si el usuario tiene rol ADMIN o STAND
        if (u.role === 'ADMIN' || u.role === 'STAND') {
          usersToUnlinkOnly.push({
            id: u.id,
            email: u.email,
            role: u.role,
            reason: `Usuario con rol ${u.role}. Solo se desvinculará el perfil de residente sin eliminar la cuenta.`,
          });
          continue;
        }

        // Comprobar si este usuario tiene otros perfiles en otras casas
        const otherProfiles = await prisma.residentProfile.count({
          where: {
            userId: u.id,
            houseId: { not: houseId },
          },
        });

        if (otherProfiles > 0) {
          usersToUnlinkOnly.push({
            id: u.id,
            email: u.email,
            role: u.role,
            reason: `Tiene asignada(s) otra(s) ${otherProfiles} casa(s). Solo se desvinculará de esta casa.`,
          });
        } else {
          usersToDelete.push({
            id: u.id,
            email: u.email,
            role: u.role,
            name: `${rp.firstName} ${rp.lastName}`.trim(),
          });
        }
      }
    }

    const deleteUserIds = usersToDelete.map((u) => u.id);

    // B. Visitantes, autorizaciones y logs
    const visitors = await prisma.visitor.findMany({
      where: { houseId },
      select: { id: true, firstName: true, photo: true },
    });
    const visitorIds = visitors.map((v) => v.id);

    const authorizations = await prisma.accessAuthorization.findMany({
      where: { visitorId: { in: visitorIds } },
      select: { id: true },
    });
    const authIds = authorizations.map((a) => a.id);

    const accessLogsCount = await prisma.accessLog.count({
      where: {
        OR: [
          ...(authIds.length > 0
            ? [{ accessAuthorizationId: { in: authIds } }]
            : []),
          ...(deleteUserIds.length > 0
            ? [{ userAcceptId: { in: deleteUserIds } }]
            : []),
        ],
      },
    });

    // C. Paquetería
    const parcels = await prisma.parcelDelivery.findMany({
      where: { houseId },
      select: { id: true, photoUrl: true, pickupCode: true },
    });

    // D. Cobranza (Cargos, Pagos, Recargos)
    const charges = await prisma.maintenanceCharge.findMany({
      where: { houseId },
      select: { id: true, proofUrl: true, concept: true },
    });
    const chargeIds = charges.map((c) => c.id);

    const payments = await prisma.payment.findMany({
      where: { maintenanceChargeId: { in: chargeIds } },
      select: { id: true, receiptUrl: true, receiptFolio: true },
    });

    const lateFeesCount = await prisma.lateFee.count({
      where: { maintenanceChargeId: { in: chargeIds } },
    });

    // E. Finanzas de la casa (HouseAccount, AccountMovement)
    const movementsCount = await prisma.accountMovement.count({
      where: { houseId },
    });
    const houseAccount = await prisma.houseAccount.findUnique({
      where: { houseId },
    });
    const houseConfig = await prisma.houseConfiguration.findUnique({
      where: { houseId },
    });

    // F. Archivos Cloudflare R2
    const r2FilesToDelete: { type: string; url: string }[] = [];

    // Comprobantes de pago (proofUrl)
    charges.forEach((c) => {
      if (c.proofUrl) {
        r2FilesToDelete.push({
          type: 'Comprobante de Pago',
          url: c.proofUrl,
        });
      }
    });

    // Recibos emitidos (receiptUrl)
    payments.forEach((p) => {
      if (p.receiptUrl) {
        r2FilesToDelete.push({
          type: 'Recibo PDF de Pago',
          url: p.receiptUrl,
        });
      }
    });

    // Fotos de paquetería (photoUrl)
    parcels.forEach((p) => {
      if (p.photoUrl) {
        r2FilesToDelete.push({
          type: 'Foto de Paquetería',
          url: p.photoUrl,
        });
      }
    });

    // Fotos de visitantes (photo)
    visitors.forEach((v) => {
      if (v.photo) {
        r2FilesToDelete.push({
          type: 'Foto de Visitante',
          url: v.photo,
        });
      }
    });

    // Mostrar Resumen de Impacto
    console.log('\n📊 RESUMEN DE ELEMENTOS A ELIMINAR:');
    console.log('------------------------------------------------------');
    console.log(`👥 Perfiles de residentes  : ${residentProfiles.length}`);
    if (usersToDelete.length > 0) {
      console.log(
        `   └─ Usuarios que se eliminarán por completo (${usersToDelete.length}):`,
      );
      usersToDelete.forEach((u) => {
        console.log(`      • ${u.name} (${u.email}) [Rol: ${u.role}]`);
      });
    }
    if (usersToUnlinkOnly.length > 0) {
      console.log(
        `   └─ Usuarios que SOLO se desvincularán (${usersToUnlinkOnly.length}):`,
      );
      usersToUnlinkOnly.forEach((u) => {
        console.log(
          `      • ${u.email} [Rol: ${u.role}] - Motivo: ${u.reason}`,
        );
      });
    }

    console.log(`🚗 Visitantes registrados  : ${visitors.length}`);
    console.log(`🔑 Autorizaciones de acceso: ${authorizations.length}`);
    console.log(`📋 Logs de acceso caseta   : ${accessLogsCount}`);
    console.log(`📦 Paquetes registrados    : ${parcels.length}`);
    console.log(`💳 Cargos de mantenimiento : ${charges.length}`);
    console.log(`💵 Pagos registrados       : ${payments.length}`);
    console.log(`⚠️  Recargos por mora       : ${lateFeesCount}`);
    console.log(`📈 Movimientos contables   : ${movementsCount}`);
    console.log(
      `🏦 Cuenta de vivienda      : ${houseAccount ? `Saldo $${houseAccount.currentBalance}` : 'Sin cuenta activa'}`,
    );
    console.log(
      `⚙️  Configuración vivienda  : ${houseConfig ? 'Existente' : 'No configurada'}`,
    );
    console.log(`☁️  Archivos físicos en R2  : ${r2FilesToDelete.length}`);

    if (r2FilesToDelete.length > 0) {
      console.log('\n📁 Detalle de archivos en Cloudflare R2:');
      r2FilesToDelete.forEach((f, idx) => {
        console.log(`   ${idx + 1}. [${f.type}] ${cleanStorageKey(f.url)}`);
      });
    }

    if (isDryRun) {
      console.log('\n======================================================');
      console.log('🔍 MODO SIMULACIÓN (--dry-run) FINALIZADO');
      console.log('   NO se realizó ningún cambio en la BD ni en R2.');
      console.log('======================================================\n');
      process.exit(0);
    }

    // Confirmación interactiva si no viene --yes
    if (!isYes) {
      console.log(
        '\n⚠️  ¡ATENCIÓN! Esta acción es COMPLETAMENTE IRREVERSIBLE.',
      );
      console.log(
        `Se destruirá la casa "${targetHouse.houseNumber}", todo su historial contable, accesos, paquetería y ${r2FilesToDelete.length} archivos en R2.`,
      );
      const answer = (
        await rl.question(
          "\n¿Estás seguro de que deseas proceder? Escribe 'SI' para confirmar: ",
        )
      ).trim();

      if (answer !== 'SI' && answer !== 'si') {
        console.log(
          '\n🛑 Operación cancelada por el usuario. No se modificó nada.',
        );
        process.exit(0);
      }
    }

    console.log('\n🚀 Iniciando eliminación en cascada...');

    // 1. Eliminar archivos de Cloudflare R2 primero
    let r2SuccessCount = 0;
    if (r2FilesToDelete.length > 0) {
      console.log('\n☁️  1/2 Eliminando archivos en Cloudflare R2...');
      for (const item of r2FilesToDelete) {
        const deleted = await deleteFromR2(item.url);
        if (deleted) r2SuccessCount++;
      }
      console.log(
        `   ✅ ${r2SuccessCount}/${r2FilesToDelete.length} archivos eliminados de R2.`,
      );
    }

    // 2. Transacción de Base de Datos
    console.log('\n🗄️  2/2 Ejecutando transacción en base de datos...');
    await prisma.$transaction(async (tx) => {
      // 1. AccessLog
      let deletedLogs = 0;
      if (authIds.length > 0 || deleteUserIds.length > 0) {
        const resLogs = await tx.accessLog.deleteMany({
          where: {
            OR: [
              ...(authIds.length > 0
                ? [{ accessAuthorizationId: { in: authIds } }]
                : []),
              ...(deleteUserIds.length > 0
                ? [{ userAcceptId: { in: deleteUserIds } }]
                : []),
            ],
          },
        });
        deletedLogs = resLogs.count;
      }
      console.log(`   - Logs de acceso eliminados: ${deletedLogs}`);

      // 2. AccessAuthorization
      if (visitorIds.length > 0) {
        const resAuth = await tx.accessAuthorization.deleteMany({
          where: { visitorId: { in: visitorIds } },
        });
        console.log(
          `   - Autorizaciones de acceso eliminadas: ${resAuth.count}`,
        );
      }

      // 3. Visitor
      const resVisitors = await tx.visitor.deleteMany({
        where: { houseId },
      });
      console.log(`   - Visitantes eliminados: ${resVisitors.count}`);

      // 4. ParcelDelivery
      const resParcels = await tx.parcelDelivery.deleteMany({
        where: {
          OR: [
            { houseId },
            ...(deleteUserIds.length > 0
              ? [
                  { receivedById: { in: deleteUserIds } },
                  { deliveredById: { in: deleteUserIds } },
                ]
              : []),
          ],
        },
      });
      console.log(`   - Paquetes de caseta eliminados: ${resParcels.count}`);

      // 5. Payments
      if (chargeIds.length > 0 || deleteUserIds.length > 0) {
        const resPay = await tx.payment.deleteMany({
          where: {
            OR: [
              ...(chargeIds.length > 0
                ? [{ maintenanceChargeId: { in: chargeIds } }]
                : []),
              ...(deleteUserIds.length > 0
                ? [{ createdById: { in: deleteUserIds } }]
                : []),
            ],
          },
        });
        console.log(`   - Pagos eliminados: ${resPay.count}`);

        // 6. LateFee
        const resLate = await tx.lateFee.deleteMany({
          where: { maintenanceChargeId: { in: chargeIds } },
        });
        console.log(`   - Recargos por mora eliminados: ${resLate.count}`);
      }

      // 7. MaintenanceCharge
      const resCharges = await tx.maintenanceCharge.deleteMany({
        where: { houseId },
      });
      console.log(`   - Cargos de cuotas eliminados: ${resCharges.count}`);

      // 8. AccountMovement
      const resMov = await tx.accountMovement.deleteMany({
        where: { houseId },
      });
      console.log(`   - Movimientos contables eliminados: ${resMov.count}`);

      // 9. HouseAccount
      const resAcc = await tx.houseAccount.deleteMany({
        where: { houseId },
      });
      console.log(`   - Cuenta de vivienda eliminada: ${resAcc.count}`);

      // 10. HouseConfiguration
      const resConf = await tx.houseConfiguration.deleteMany({
        where: { houseId },
      });
      console.log(`   - Configuración de vivienda eliminada: ${resConf.count}`);

      // 11. Sesiones, Tokens y Push de usuarios residentes a eliminar
      if (deleteUserIds.length > 0) {
        const resPush = await tx.pushSubscription.deleteMany({
          where: { userId: { in: deleteUserIds } },
        });
        console.log(`   - Suscripciones push eliminadas: ${resPush.count}`);

        const resSess = await tx.userSession.deleteMany({
          where: { userId: { in: deleteUserIds } },
        });
        console.log(`   - Sesiones eliminadas: ${resSess.count}`);

        const resTokens = await tx.passwordResetToken.deleteMany({
          where: { userId: { in: deleteUserIds } },
        });
        console.log(`   - Tokens de reseteo eliminados: ${resTokens.count}`);
      }

      // 12. ResidentProfile
      const resProf = await tx.residentProfile.deleteMany({
        where: { houseId },
      });
      console.log(`   - Perfiles de residente eliminados: ${resProf.count}`);

      // 13. Users (solo los que pertenecían exclusivamente a esta casa y no son ADMIN)
      if (deleteUserIds.length > 0) {
        const resUsers = await tx.user.deleteMany({
          where: { id: { in: deleteUserIds } },
        });
        console.log(`   - Usuarios residentes eliminados: ${resUsers.count}`);
      }

      // 14. House
      await tx.house.delete({
        where: { id: houseId },
      });
      console.log(
        `   - Casa "${targetHouse.houseNumber}" (${targetHouse.id}) eliminada exitosamente.`,
      );
    });

    console.log('\n======================================================');
    console.log('✅ ¡CASA Y DEPENDENCIAS ELIMINADAS SATISFACTORIAMENTE!');
    console.log(`   Condominio : ${condo.name} (${condo.key})`);
    console.log(`   Casa       : ${targetHouse.houseNumber}`);
    console.log(
      '   Sin registros huérfanos en la base de datos ni archivos en R2.',
    );
    console.log('======================================================\n');
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ ERROR DURANTE LA ELIMINACIÓN:', err);
  process.exit(1);
});
