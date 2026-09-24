import 'dotenv/config';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import {
  PrismaClient,
  AccountMovementType,
} from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Inicialización de cliente Cloudflare R2 / S3
const endpoint = process.env.STORAGE_ENDPOINT;
const accessKeyId = process.env.STORAGE_ACCESS_KEY_ID;
const secretAccessKey = process.env.STORAGE_SECRET_ACCESS_KEY;
const region = process.env.STORAGE_REGION || 'auto';
const bucketName = process.env.STORAGE_BUCKET_NAME || 'condofy-private';

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

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

function parseMonth(monthInput: string): number | null {
  if (!monthInput) return null;
  const num = parseInt(monthInput, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;

  const normalized = monthInput
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const idx = MONTH_NAMES.findIndex(
    (m) =>
      m
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') === normalized,
  );
  return idx !== -1 ? idx + 1 : null;
}

function cleanStorageKey(rawUrlOrKey: string): string {
  if (!rawUrlOrKey) return '';
  let key = rawUrlOrKey.trim();
  // Si viene como URL completa (https://...), extraer únicamente la ruta relativa del key
  if (key.startsWith('http://') || key.startsWith('https://')) {
    try {
      const url = new URL(key);
      key = url.pathname.replace(/^\/+/, '');
      // Si el bucketName está al inicio de la ruta, removerlo
      if (bucketName && key.startsWith(`${bucketName}/`)) {
        key = key.replace(`${bucketName}/`, '');
      }
    } catch {
      // Si no es URL válida, usar como string
    }
  }
  return key;
}

async function deleteFromR2(key: string): Promise<boolean> {
  if (!key) return false;
  const cleanedKey = cleanStorageKey(key);

  if (!s3Client) {
    console.log(
      `   [R2 SIMULATION] Archivo omitido (sin credenciales R2): ${cleanedKey}`,
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

async function main() {
  const args = process.argv.slice(2);
  const isYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');
  const isHardDelete =
    args.includes('--hard-delete') || args.includes('--delete-charges');

  // Filtrar banderas para obtener argumentos posicionales
  const positionalArgs = args.filter((a) => !a.startsWith('-'));

  let monthArg = positionalArgs[0];
  let yearArg = positionalArgs[1];
  let condoArg = positionalArgs[2];

  console.log(
    '\n=============================================================',
  );
  console.log('🧹 CONDOFY - REINICIO Y ELIMINACIÓN DE COBRANZA / RECIBOS R2');
  console.log(
    '=============================================================\n',
  );

  const rl = readline.createInterface({ input, output });

  // 1. Validar o solicitar condominio
  const condominiums = await prisma.condominium.findMany({
    select: { id: true, name: true, key: true },
    orderBy: { name: 'asc' },
  });

  if (condominiums.length === 0) {
    console.error(
      '❌ No se encontraron condominios registrados en la base de datos.',
    );
    rl.close();
    process.exit(1);
  }

  let selectedCondo = condominiums[0];
  if (condominiums.length > 1) {
    if (condoArg) {
      const found = condominiums.find(
        (c) =>
          c.id === condoArg ||
          c.key.toLowerCase() === condoArg.toLowerCase() ||
          c.name.toLowerCase().includes(condoArg.toLowerCase()),
      );
      if (found) {
        selectedCondo = found;
      } else {
        console.error(`❌ Condominio no encontrado con: "${condoArg}"`);
        rl.close();
        process.exit(1);
      }
    } else {
      console.log('Condominios disponibles:');
      condominiums.forEach((c, idx) => {
        console.log(`  [${idx + 1}] ${c.name} (Clave: ${c.key})`);
      });
      const answer = await rl.question(
        `\nSelecciona el número de condominio (1-${condominiums.length}) [1]: `,
      );
      const chosenIdx = parseInt(answer.trim() || '1', 10) - 1;
      selectedCondo = condominiums[chosenIdx] || condominiums[0];
    }
  }

  console.log(
    `🏢 Condominio seleccionado: ${selectedCondo.name} (ID: ${selectedCondo.id})\n`,
  );

  // 2. Validar o solicitar Mes
  let month = parseMonth(monthArg);
  while (!month) {
    const inputMonth = await rl.question(
      '📅 Ingresa el MES a reiniciar (número 1-12 o nombre, ej: 9 o Septiembre): ',
    );
    month = parseMonth(inputMonth.trim());
    if (!month) {
      console.log('⚠️  Mes no válido. Intenta nuevamente.');
    }
  }

  // 3. Validar o solicitar Año
  let year = yearArg ? parseInt(yearArg, 10) : null;
  while (!year || isNaN(year) || year < 2000 || year > 2100) {
    const defaultYear = new Date().getFullYear();
    const inputYear = await rl.question(`📅 Ingresa el AÑO [${defaultYear}]: `);
    year = parseInt(inputYear.trim() || String(defaultYear), 10);
    if (isNaN(year) || year < 2000 || year > 2100) {
      console.log('⚠️  Año no válido. Intenta nuevamente.');
    }
  }

  const monthName = MONTH_NAMES[month - 1];
  const periodLabel = `${monthName} ${year}`;
  console.log(
    `\n🎯 Periodo objetivo: ${periodLabel} (${year}-${String(month).padStart(2, '0')})`,
  );

  // 4. Buscar MaintenancePeriod
  const period = await prisma.maintenancePeriod.findFirst({
    where: {
      condominiumId: selectedCondo.id,
      year,
      month,
    },
    include: {
      charges: {
        include: {
          house: true,
          payments: true,
          lateFees: true,
        },
      },
    },
  });

  // Si no está ligado por MaintenancePeriod, buscar cargos que caigan en ese mes/año por dueDate
  let charges = period?.charges || [];
  if (charges.length === 0) {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    charges = await prisma.maintenanceCharge.findMany({
      where: {
        condominiumId: selectedCondo.id,
        dueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        house: true,
        payments: true,
        lateFees: true,
      },
    });
  }

  if (charges.length === 0 && !period) {
    console.log(
      `ℹ️  No existen registros de cargos ni pagos para ${periodLabel}.`,
    );
    console.log('El periodo ya se encuentra limpio.');
    rl.close();
    process.exit(0);
  }

  // Recolectar datos a eliminar
  const allPayments = charges.flatMap((c) => c.payments);
  const allLateFees = charges.flatMap((c) => c.lateFees);
  const totalCollected = allPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0,
  );

  // Recolectar archivos en R2
  const r2Receipts: string[] = [];
  const r2Proofs: string[] = [];

  for (const p of allPayments) {
    if (p.receiptUrl && p.receiptUrl.trim()) {
      r2Receipts.push(p.receiptUrl.trim());
    }
  }

  for (const c of charges) {
    if (c.proofUrl && c.proofUrl.trim()) {
      r2Proofs.push(c.proofUrl.trim());
    }
  }

  const allR2Keys = Array.from(new Set([...r2Receipts, ...r2Proofs]));

  console.log('\n📊 RESUMEN DE ELEMENTOS ENCONTRADOS:');
  console.log('-------------------------------------------------------------');
  console.log(` • Viviendas / Cargos en periodo:  ${charges.length}`);
  console.log(` • Total de pagos registrados:    ${allPayments.length}`);
  console.log(
    ` • Importe cobrado a revertir:    $${totalCollected.toLocaleString('es-MX')} MXN`,
  );
  console.log(` • Recargos por mora asociados:   ${allLateFees.length}`);
  console.log(
    ` • Documentos y recibos en R2:     ${allR2Keys.length} (${r2Receipts.length} recibos oficiales, ${r2Proofs.length} comprobantes)`,
  );
  console.log(
    ` • Modo de operación:             ${
      isHardDelete
        ? 'ELIMINACIÓN TOTAL (Cargos y periodo se eliminan)'
        : 'REINICIO LIMPIO (Cargos quedan en PENDIENTE con $0)'
    }`,
  );
  if (isDryRun) {
    console.log(
      ' • [MODO DRY-RUN ACTIVO]: No se modificará la base de datos ni R2.',
    );
  }
  console.log(
    '-------------------------------------------------------------\n',
  );

  if (allPayments.length === 0 && allR2Keys.length === 0 && !isHardDelete) {
    console.log(
      'ℹ️  No hay pagos ni archivos en R2 para eliminar en este periodo.',
    );
    rl.close();
    process.exit(0);
  }

  // Confirmación
  if (!isYes && !isDryRun) {
    const confirmation = await rl.question(
      `⚠️  ¿Estás seguro de que deseas eliminar los pagos y recibos de ${periodLabel}? (escribe 'SI' para confirmar): `,
    );
    if (confirmation.trim().toUpperCase() !== 'SI') {
      console.log('🛑 Operación cancelada por el usuario.');
      rl.close();
      process.exit(0);
    }
  }

  rl.close();

  if (isDryRun) {
    console.log('\n🔎 MODO DRY-RUN: Archivos R2 que se habrían eliminado:');
    allR2Keys.forEach((key) => console.log(`   - ${key}`));
    console.log('\n✅ Prueba completada sin realizar cambios.');
    process.exit(0);
  }

  console.log('\n🚀 Iniciando proceso de eliminación y limpieza...');

  // 1. Eliminar archivos de Cloudflare R2
  if (allR2Keys.length > 0) {
    console.log(
      `\n🗑️  Eliminando ${allR2Keys.length} archivos de Cloudflare R2 (${bucketName})...`,
    );
    let deletedR2Count = 0;
    for (const key of allR2Keys) {
      const ok = await deleteFromR2(key);
      if (ok) {
        deletedR2Count++;
        console.log(`   ✅ R2 eliminado: ${cleanStorageKey(key)}`);
      }
    }
    console.log(
      `   📦 Total eliminados de R2: ${deletedR2Count}/${allR2Keys.length}`,
    );
  }

  const chargeIds = charges.map((c) => c.id);

  // 2. Transacción de Base de Datos
  await prisma.$transaction(async (tx) => {
    // A. Revertir saldos a favor generados por excedentes en estos pagos
    for (const charge of charges) {
      const excessMovements = await tx.accountMovement.findMany({
        where: {
          houseId: charge.houseId,
          type: AccountMovementType.CREDIT,
          description: {
            contains: charge.concept,
          },
        },
      });

      for (const mov of excessMovements) {
        const movAmount = Number(mov.amount);
        if (movAmount > 0) {
          // Descontar el saldo a favor que se había acreditado
          await tx.houseAccount.updateMany({
            where: { houseId: charge.houseId },
            data: {
              currentBalance: {
                decrement: movAmount,
              },
            },
          });
          // Eliminar el movimiento contable
          await tx.accountMovement.delete({
            where: { id: mov.id },
          });
          console.log(
            `   💰 Saldo a favor revertido para casa: -$${movAmount} MXN`,
          );
        }
      }
    }

    // B. Eliminar registros de Payment
    if (allPayments.length > 0) {
      const deletedPayments = await tx.payment.deleteMany({
        where: {
          maintenanceChargeId: { in: chargeIds },
        },
      });
      console.log(`   💳 Pagos eliminados de BD: ${deletedPayments.count}`);
    }

    // C. Eliminar registros de LateFee
    if (allLateFees.length > 0) {
      const deletedLateFees = await tx.lateFee.deleteMany({
        where: {
          maintenanceChargeId: { in: chargeIds },
        },
      });
      console.log(
        `   ⏳ Recargos por mora eliminados de BD: ${deletedLateFees.count}`,
      );
    }

    if (isHardDelete) {
      // D1. Eliminar completamente MaintenanceCharge y MaintenancePeriod
      const deletedCharges = await tx.maintenanceCharge.deleteMany({
        where: {
          id: { in: chargeIds },
        },
      });
      console.log(`   📋 Cargos eliminados de BD: ${deletedCharges.count}`);

      if (period) {
        await tx.maintenancePeriod.delete({
          where: { id: period.id },
        });
        console.log(`   📅 Periodo mensual eliminado de BD: ${period.name}`);
      }
    } else {
      // D2. Reiniciar MaintenanceCharge a estatus PENDING con $0 pagados
      const updatedCharges = await tx.maintenanceCharge.updateMany({
        where: {
          id: { in: chargeIds },
        },
        data: {
          status: 'PENDING',
          paidAmount: 0,
          notes: null,
          proofUrl: null,
          proofFileName: null,
          proofUploadedAt: null,
          proofReference: null,
          proofNotes: null,
        },
      });
      console.log(
        `   🔄 Cargos reiniciados a estatus PENDIENTE ($0 pagado): ${updatedCharges.count}`,
      );
    }
  });

  console.log(
    '\n=============================================================',
  );
  console.log('✅ PROCESO COMPLETADO EXITOSAMENTE');
  console.log('=============================================================');
  console.log(
    `El periodo ${periodLabel} ha quedado completamente reiniciado y limpio.`,
  );
  console.log(
    'Ahora puedes entrar a la plataforma y cargar todos los pagos desde cero.',
  );
  console.log(
    '=============================================================\n',
  );
}

main()
  .catch((err) => {
    console.error('\n❌ Ocurrió un error inesperado al ejecutar el script:');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
