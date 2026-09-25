import 'dotenv/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import {
  PrismaClient,
  AccountMovementType,
  MaintenanceChargeStatus,
} from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Inicialización de cliente Cloudflare R2 / S3
const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
const region = process.env.STORAGE_REGION || 'auto';
const bucketName =
  process.env.STORAGE_BUCKET_NAME ||
  process.env.AWS_BUCKET_NAME ||
  'condofy-private';

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
      // Ignorar error de parsing
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
Uso del script de eliminación de pago:
  yarn delete:payment [condominio] [casa] [pago/folio] [opciones]
  npx tsx scripts/delete-payment.ts [opciones]

Argumentos posicionales:
  condominio   Clave (ej: albero), ID o nombre del condominio
  casa         Número de la casa (ej: 101, B-12) o UUID de la vivienda
  pago/folio   ID del pago o folio de recibo (ej: REC-101-839212)

Opciones:
  --condo, --condominium <term>   Key, ID o nombre del condominio
  --house <term>                  Número de casa (ej: "12", "101") o ID de la casa
  --payment, --paymentId <id>     ID del pago o folio de recibo (ej: "REC-101-123456")
  --keep-receipt                  No eliminar el comprobante/recibo de Cloudflare R2
  --dry-run                       Simular sin modificar la base de datos ni R2
  -y, --yes                       Confirmar automáticamente sin preguntar
  -h, --help                      Mostrar esta ayuda

Ejemplos:
  yarn delete:payment
  yarn delete:payment albero 101
  yarn delete:payment albero 101 REC-101-839212 --dry-run
  yarn delete:payment albero 101 REC-101-839212 --yes
  yarn delete:payment --condo=PALMAS --house=101 --keep-receipt
`);
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const isYes = args.includes('-y') || args.includes('--yes');
  const keepReceipt = args.includes('--keep-receipt');

  let condoArg: string | undefined;
  let houseArg: string | undefined;
  let paymentArg: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--condo=') || a.startsWith('--condominium=')) {
      condoArg = a.split('=')[1];
    } else if (a === '--condo' || a === '--condominium') {
      condoArg = args[i + 1];
      i++;
    } else if (a.startsWith('--house=')) {
      houseArg = a.split('=')[1];
    } else if (a === '--house') {
      houseArg = args[i + 1];
      i++;
    } else if (
      a.startsWith('--payment=') ||
      a.startsWith('--paymentId=') ||
      a.startsWith('--folio=')
    ) {
      paymentArg = a.split('=')[1];
    } else if (a === '--payment' || a === '--paymentId' || a === '--folio') {
      paymentArg = args[i + 1];
      i++;
    }
  }

  // Soporte para argumentos posicionales (ej: yarn delete:payment albero 101 REC-101-...)
  const positionalArgs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('-')) {
      if (
        [
          '--condo',
          '--condominium',
          '--house',
          '--payment',
          '--paymentId',
          '--folio',
        ].includes(a)
      ) {
        i++;
      }
      continue;
    }
    positionalArgs.push(a);
  }

  if (!condoArg && positionalArgs.length > 0) condoArg = positionalArgs[0];
  if (!houseArg && positionalArgs.length > 1) houseArg = positionalArgs[1];
  if (!paymentArg && positionalArgs.length > 2) paymentArg = positionalArgs[2];

  console.log(
    '\n=============================================================',
  );
  console.log('💳 CONDOFY - ELIMINACIÓN DE PAGO DE CUOTA DE CONDOMINIO');
  console.log(
    '=============================================================\n',
  );

  const rl = readline.createInterface({ input, output });

  // 1. SELECCIÓN DE CONDOMINIO
  const condominiums = await prisma.condominium.findMany({
    select: { id: true, name: true, key: true },
    orderBy: { name: 'asc' },
  });

  if (condominiums.length === 0) {
    console.error('❌ No se encontraron condominios en la base de datos.');
    rl.close();
    process.exit(1);
  }

  let selectedCondo = null;
  if (condoArg) {
    const q = condoArg.trim().toLowerCase();
    selectedCondo = condominiums.find(
      (c) =>
        c.id.toLowerCase() === q ||
        c.key.toLowerCase() === q ||
        c.name.toLowerCase().includes(q),
    );
    if (!selectedCondo) {
      console.warn(
        `⚠️  No se encontró ningún condominio coincidente con: "${condoArg}"\n`,
      );
    }
  }

  while (!selectedCondo) {
    console.log('🏢 CONDOMINIOS DISPONIBLES:');
    condominiums.forEach((c, idx) => {
      console.log(`  [${idx + 1}] ${c.name} (Clave: ${c.key} | ID: ${c.id})`);
    });

    const promptText =
      condominiums.length === 1
        ? `\n👉 Selecciona el condominio [1]: `
        : `\n👉 Selecciona el condominio [1-${condominiums.length}] o escribe nombre/clave: `;

    const ans = (await rl.question(promptText)).trim();
    const chosenIdx =
      ans === '' && condominiums.length === 1 ? 0 : parseInt(ans, 10) - 1;

    if (
      !isNaN(chosenIdx) &&
      chosenIdx >= 0 &&
      chosenIdx < condominiums.length
    ) {
      selectedCondo = condominiums[chosenIdx];
    } else if (ans.length > 0) {
      const q = ans.toLowerCase();
      selectedCondo = condominiums.find(
        (c) =>
          c.id.toLowerCase() === q ||
          c.key.toLowerCase() === q ||
          c.name.toLowerCase().includes(q),
      );
    }

    if (!selectedCondo) {
      console.log('❌ Selección inválida. Por favor intenta de nuevo.\n');
    }
  }

  console.log(
    `\n✅ Condominio seleccionado: ${selectedCondo.name} (Clave: ${selectedCondo.key})`,
  );

  // 2. SELECCIÓN DE CASA
  let selectedHouse: any = null;

  if (houseArg) {
    const q = houseArg.trim().toLowerCase();
    const isUuid = UUID_REGEX.test(q);

    selectedHouse = await prisma.house.findFirst({
      where: {
        condominiumId: selectedCondo.id,
        ...(isUuid
          ? { id: q }
          : {
              OR: [
                {
                  houseNumber: { equals: houseArg.trim(), mode: 'insensitive' },
                },
                {
                  houseNumber: {
                    equals: houseArg.trim().replace(/^casa\s+/i, ''),
                    mode: 'insensitive',
                  },
                },
              ],
            }),
      },
      include: {
        residents: {
          include: { user: true },
        },
        houseAccount: true,
      },
    });

    if (!selectedHouse) {
      console.warn(
        `⚠️  No se encontró la vivienda "${houseArg}" en ${selectedCondo.name}.\n`,
      );
    }
  }

  while (!selectedHouse) {
    // Buscar casas que tengan cargos con pagos registrados para orientar al usuario
    const housesWithPayments = await prisma.house.findMany({
      where: {
        condominiumId: selectedCondo.id,
        maintenanceCharges: {
          some: {
            payments: { some: {} },
          },
        },
      },
      include: {
        residents: { include: { user: true } },
        houseAccount: true,
      },
      orderBy: { houseNumber: 'asc' },
      take: 20,
    });

    if (housesWithPayments.length > 0) {
      console.log('\n🏡 VIVIENDAS CON PAGOS REGISTRADOS:');
      housesWithPayments.forEach((h, idx) => {
        const resident = h.residents[0]?.user;
        const resName = resident
          ? `${resident.firstName} ${resident.lastName}`
          : 'Sin residente';
        console.log(
          `  [${idx + 1}] Casa ${h.houseNumber}${h.tower ? ` (Torre: ${h.tower})` : ''} - ${resName}`,
        );
      });
    }

    const ans = (
      await rl.question(
        '\n👉 Ingresa el número de casa (ej: "101") o selecciona de la lista anterior: ',
      )
    ).trim();

    if (!ans) continue;

    const chosenIdx = parseInt(ans, 10) - 1;
    if (
      !isNaN(chosenIdx) &&
      chosenIdx >= 0 &&
      chosenIdx < housesWithPayments.length
    ) {
      selectedHouse = housesWithPayments[chosenIdx];
      break;
    }

    const isUuid = UUID_REGEX.test(ans);
    selectedHouse = await prisma.house.findFirst({
      where: {
        condominiumId: selectedCondo.id,
        ...(isUuid
          ? { id: ans }
          : {
              OR: [
                { houseNumber: { equals: ans, mode: 'insensitive' } },
                {
                  houseNumber: {
                    equals: ans.replace(/^casa\s+/i, ''),
                    mode: 'insensitive',
                  },
                },
              ],
            }),
      },
      include: {
        residents: { include: { user: true } },
        houseAccount: true,
      },
    });

    if (!selectedHouse) {
      console.log(`❌ No se encontró la casa "${ans}". Intenta de nuevo.`);
    }
  }

  const primaryResident = selectedHouse.residents?.[0]?.user;
  const residentFullName = primaryResident
    ? `${primaryResident.firstName} ${primaryResident.lastName}`.trim()
    : 'Sin residente asignado';

  console.log(
    `\n✅ Vivienda seleccionada: Casa ${selectedHouse.houseNumber}${
      selectedHouse.tower ? ` (Torre ${selectedHouse.tower})` : ''
    } - Residente: ${residentFullName}`,
  );

  // 3. CONSULTAR PAGOS DE LA VIVIENDA
  const payments = await prisma.payment.findMany({
    where: {
      maintenanceCharge: {
        houseId: selectedHouse.id,
        condominiumId: selectedCondo.id,
      },
    },
    include: {
      maintenanceCharge: {
        include: {
          lateFees: true,
          payments: true,
          maintenancePeriod: true,
        },
      },
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { paymentDate: 'desc' },
  });

  if (payments.length === 0) {
    console.log(
      `\nℹ️  La Casa ${selectedHouse.houseNumber} no tiene ningún pago registrado. No hay nada que eliminar.`,
    );
    rl.close();
    process.exit(0);
  }

  // 4. SELECCIONAR PAGO A ELIMINAR
  let targetPayment: any = null;

  if (paymentArg) {
    const q = paymentArg.trim().toLowerCase();
    targetPayment = payments.find(
      (p) =>
        p.id.toLowerCase() === q ||
        (p.receiptFolio && p.receiptFolio.toLowerCase() === q) ||
        (p.reference && p.reference.toLowerCase() === q),
    );
    if (!targetPayment) {
      console.warn(
        `⚠️  No se encontró ningún pago coincidente con: "${paymentArg}"\n`,
      );
    }
  }

  while (!targetPayment) {
    console.log(
      `\n💳 PAGOS REGISTRADOS PARA CASA ${selectedHouse.houseNumber} (${payments.length} encontrado${
        payments.length === 1 ? '' : 's'
      }):`,
    );
    console.log(
      '-------------------------------------------------------------',
    );

    payments.forEach((p, idx) => {
      const charge = p.maintenanceCharge;
      const dateStr = p.paymentDate
        ? new Date(p.paymentDate).toISOString().split('T')[0]
        : 'S/F';
      const amountStr = `$${Number(p.amount).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
      })} MXN`;
      const folioStr = p.receiptFolio || 'Sin Folio';
      const methodStr = p.paymentMethod || 'TRANSFER';
      const hasReceipt = Boolean(p.receiptUrl);

      console.log(
        `  [${idx + 1}] Fecha: ${dateStr} | ${amountStr} | ${methodStr} | Folio: ${folioStr}`,
      );
      console.log(
        `      Cargo: "${charge.concept}" (Status actual: ${charge.status}, Pagado: $${Number(charge.paidAmount).toLocaleString('es-MX')})`,
      );
      if (p.reference) {
        console.log(`      Referencia bancaria: ${p.reference}`);
      }
      if (hasReceipt) {
        console.log(
          `      Comprobante en R2: ${cleanStorageKey(p.receiptUrl!)}`,
        );
      }
      if (p.createdBy) {
        console.log(
          `      Registrado por: ${p.createdBy.firstName} ${p.createdBy.lastName}`,
        );
      }
      console.log('');
    });

    const promptText =
      payments.length === 1
        ? `👉 Selecciona el pago a eliminar [1]: `
        : `👉 Selecciona el número de pago a eliminar [1-${payments.length}]: `;

    const ans = (await rl.question(promptText)).trim();
    const chosenIdx =
      ans === '' && payments.length === 1 ? 0 : parseInt(ans, 10) - 1;

    if (!isNaN(chosenIdx) && chosenIdx >= 0 && chosenIdx < payments.length) {
      targetPayment = payments[chosenIdx];
    } else {
      console.log(
        '❌ Opción inválida. Por favor ingresa un número de la lista.',
      );
    }
  }

  // 5. CÁLCULO DE IMPACTO Y RESUMEN
  const charge = targetPayment.maintenanceCharge;
  const paymentAmount = Number(targetPayment.amount);
  const currentPaid = Number(charge.paidAmount || 0);

  // Calcular otros pagos asociados a este mismo cargo (si hubieron abonos parciales)
  const otherPaymentsOnCharge = charge.payments.filter(
    (p: any) => p.id !== targetPayment.id,
  );
  const newPaidAmount = otherPaymentsOnCharge.reduce(
    (sum: number, p: any) => sum + Number(p.amount),
    0,
  );

  const baseAmount = Number(charge.amount);
  const lateFeesTotal = (charge.lateFees || []).reduce(
    (sum: number, f: any) => sum + Number(f.amount),
    0,
  );
  const totalDue = baseAmount + lateFeesTotal;

  let newChargeStatus: MaintenanceChargeStatus;
  if (newPaidAmount >= totalDue) {
    newChargeStatus = MaintenanceChargeStatus.PAID;
  } else if (newPaidAmount > 0) {
    newChargeStatus = MaintenanceChargeStatus.PARTIAL;
  } else {
    const now = new Date();
    newChargeStatus =
      now > charge.dueDate
        ? MaintenanceChargeStatus.OVERDUE
        : MaintenanceChargeStatus.PENDING;
  }

  // Verificar si hubo excedente registrado como saldo a favor en HouseAccount
  const excessMovements = await prisma.accountMovement.findMany({
    where: {
      houseId: selectedHouse.id,
      type: AccountMovementType.CREDIT,
      description: {
        contains: charge.concept,
      },
    },
  });

  const excessAmount = excessMovements.reduce(
    (sum, m) => sum + Number(m.amount),
    0,
  );

  const receiptKey = targetPayment.receiptUrl
    ? cleanStorageKey(targetPayment.receiptUrl)
    : null;

  console.log('\n📊 RESUMEN DE IMPACTO - PAGO A ELIMINAR:');
  console.log('-------------------------------------------------------------');
  console.log(
    ` • Condominio:           ${selectedCondo.name} (${selectedCondo.key})`,
  );
  console.log(
    ` • Vivienda:             Casa ${selectedHouse.houseNumber} (${residentFullName})`,
  );
  console.log(` • ID del Pago:          ${targetPayment.id}`);
  console.log(
    ` • Folio de Recibo:      ${targetPayment.receiptFolio || 'N/A'}`,
  );
  console.log(
    ` • Importe del Pago:     $${paymentAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
  );
  console.log(` • Forma de Pago:        ${targetPayment.paymentMethod}`);
  console.log(
    ` • Fecha de Pago:        ${new Date(targetPayment.paymentDate).toISOString().split('T')[0]}`,
  );
  console.log('-------------------------------------------------------------');
  console.log('📋 EFECTO EN EL CARGO DE MANTENIMIENTO:');
  console.log(` • Concepto:             "${charge.concept}"`);
  console.log(
    ` • Importe total exigible:$${totalDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`,
  );
  console.log(
    ` • Monto pagado:         $${currentPaid.toLocaleString('es-MX')} ➡️  $${newPaidAmount.toLocaleString('es-MX')} MXN`,
  );
  console.log(
    ` • Estatus del cargo:    ${charge.status} ➡️  ${newChargeStatus}`,
  );
  if (excessAmount > 0) {
    console.log(
      ` • Saldo a favor:        Se revertirán $${excessAmount.toLocaleString('es-MX')} MXN del saldo a favor generado por este pago.`,
    );
  }
  if (receiptKey) {
    if (keepReceipt) {
      console.log(
        ` • Comprobante R2:       Se conservará en Cloudflare R2 (--keep-receipt activo).`,
      );
    } else {
      console.log(
        ` • Comprobante R2:       Se eliminará de Cloudflare R2 (${receiptKey}).`,
      );
    }
  }
  if (isDryRun) {
    console.log('\n🔍 [MODO DRY-RUN ACTIVO]: No se guardará ningún cambio.');
  }
  console.log(
    '-------------------------------------------------------------\n',
  );

  // 6. CONFIRMACIÓN INTERACTIVA
  if (!isYes && !isDryRun) {
    const confirmation = await rl.question(
      `⚠️  ¿Confirmas la eliminación permanente de este pago de $${paymentAmount.toLocaleString('es-MX')} MXN? (escribe 'SI' para confirmar): `,
    );
    if (confirmation.trim().toUpperCase() !== 'SI') {
      console.log(
        '🛑 Operación cancelada por el usuario. No se modificó nada.',
      );
      rl.close();
      process.exit(0);
    }
  }

  rl.close();

  if (isDryRun) {
    console.log(
      '✅ Simulación completada con éxito. Ningún dato fue alterado.',
    );
    process.exit(0);
  }

  console.log('\n🚀 Procesando eliminación en base de datos...');

  // 7. EJECUCIÓN EN TRANSACCIÓN DE BASE DE DATOS
  await prisma.$transaction(async (tx) => {
    // A. Revertir saldo a favor si hubo excedente asociado a este pago
    if (excessMovements.length > 0) {
      for (const mov of excessMovements) {
        const movAmount = Number(mov.amount);
        if (movAmount > 0) {
          await tx.houseAccount.updateMany({
            where: { houseId: selectedHouse.id },
            data: {
              currentBalance: {
                decrement: movAmount,
              },
            },
          });
          await tx.accountMovement.delete({
            where: { id: mov.id },
          });
          console.log(
            `   💰 Saldo a favor revertido en cuenta de vivienda: -$${movAmount.toLocaleString('es-MX')} MXN`,
          );
        }
      }
    }

    // B. Actualizar el cargo de mantenimiento
    await tx.maintenanceCharge.update({
      where: { id: charge.id },
      data: {
        paidAmount: newPaidAmount,
        status: newChargeStatus,
      },
    });
    console.log(
      `   📋 Cargo "${charge.concept}" actualizado a estatus "${newChargeStatus}" con $${newPaidAmount.toLocaleString('es-MX')} pagados.`,
    );

    // C. Eliminar el registro de Payment
    await tx.payment.delete({
      where: { id: targetPayment.id },
    });
    console.log(
      `   💳 Registro de pago eliminado de la base de datos (ID: ${targetPayment.id}).`,
    );
  });

  // 8. ELIMINAR ARCHIVO DE CLOUDFLARE R2 / S3
  if (receiptKey && !keepReceipt) {
    console.log(`\n🗑️  Eliminando archivo de recibo en Cloudflare R2...`);
    const ok = await deleteFromR2(receiptKey);
    if (ok) {
      console.log(`   ✅ Archivo R2 eliminado correctamente: ${receiptKey}`);
    } else {
      console.warn(
        `   ⚠️  No se pudo eliminar el archivo en R2 (${receiptKey}).`,
      );
    }
  }

  console.log(
    '\n=============================================================',
  );
  console.log('🎉 ¡PAGO ELIMINADO EXITOSAMENTE!');
  console.log('=============================================================');
  console.log(` • Vivienda:       Casa ${selectedHouse.houseNumber}`);
  console.log(` • Cargo:          ${charge.concept}`);
  console.log(` • Nuevo Estatus:  ${newChargeStatus}`);
  console.log(
    ` • Monto Pagado:   $${newPaidAmount.toLocaleString('es-MX')} MXN`,
  );
  console.log(
    '=============================================================\n',
  );
}

main()
  .catch((err) => {
    console.error('\n💥 Error fatal durante la ejecución:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
