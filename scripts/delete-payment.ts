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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso del script de reinicio / eliminación de pago por casa:
  yarn delete:payment [condominio] [casa] [mes] [año] [opciones]
  npx tsx scripts/delete-payment.ts [opciones]

Argumentos posicionales:
  condominio   Clave (ej: albero), ID o nombre del condominio
  casa         Número de la casa (ej: 101, 36, "Casa 1")
  mes          Mes a reiniciar (1-12 o nombre: "septiembre", "9")
  año          Año a reiniciar (ej: 2026)

Opciones:
  --condo, --condominium <term>   Key, ID o nombre del condominio
  --house <term>                  Número de casa (ej: "12", "101") o ID de la casa
  --month <mes>                   Mes del cargo (1-12 o nombre: septiembre)
  --year <año>                    Año del cargo (ej: 2026)
  --period <YYYY-MM>              Periodo directo (ej: 2026-09)
  --payment, --paymentId <id>     ID del pago o folio de recibo directo
  --keep-receipt                  No eliminar los comprobantes/recibos de Cloudflare R2
  --dry-run                       Simular sin modificar la base de datos ni R2
  -y, --yes                       Confirmar automáticamente sin preguntar
  -h, --help                      Mostrar esta ayuda

Ejemplos:
  yarn delete:payment
  yarn delete:payment albero 36
  yarn delete:payment albero 36 9 2026
  yarn delete:payment albero 1 septiembre 2026 --dry-run
  yarn delete:payment albero 1 septiembre 2026 --yes
`);
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const isYes = args.includes('-y') || args.includes('--yes');
  const keepReceipt = args.includes('--keep-receipt');

  let condoArg: string | undefined;
  let houseArg: string | undefined;
  let monthArg: string | undefined;
  let yearArg: string | undefined;
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
    } else if (a.startsWith('--month=')) {
      monthArg = a.split('=')[1];
    } else if (a === '--month') {
      monthArg = args[i + 1];
      i++;
    } else if (a.startsWith('--year=')) {
      yearArg = a.split('=')[1];
    } else if (a === '--year') {
      yearArg = args[i + 1];
      i++;
    } else if (a.startsWith('--period=')) {
      const p = a.split('=')[1];
      if (p.includes('-')) {
        const parts = p.split('-');
        yearArg = parts[0];
        monthArg = parts[1];
      }
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

  // Detectar argumentos posicionales
  const positionalArgs: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('-')) {
      if (
        [
          '--condo',
          '--condominium',
          '--house',
          '--month',
          '--year',
          '--period',
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
  if (!monthArg && positionalArgs.length > 2) monthArg = positionalArgs[2];
  if (!yearArg && positionalArgs.length > 3) yearArg = positionalArgs[3];

  console.log(
    '\n=============================================================',
  );
  console.log('💳 CONDOFY - REINICIO DE MES DE PAGO DE UNA CASA');
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
    const isUuid = UUID_REGEX.test(houseArg.trim());

    selectedHouse = await prisma.house.findFirst({
      where: {
        condominiumId: selectedCondo.id,
        ...(isUuid
          ? { id: houseArg.trim() }
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
                {
                  houseNumber: {
                    equals: `Casa ${houseArg.trim().replace(/^casa\s+/i, '')}`,
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
      console.warn(
        `⚠️  No se encontró la casa "${houseArg}" en este condominio.\n`,
      );
    }
  }

  while (!selectedHouse) {
    // Listar casas que tienen cargos o pagos en el condominio
    const housesWithCharges = await prisma.house.findMany({
      where: {
        condominiumId: selectedCondo.id,
      },
      include: {
        residents: { include: { user: true } },
        houseAccount: true,
        maintenanceCharges: {
          select: { id: true, status: true, paidAmount: true },
        },
      },
      orderBy: [{ tower: 'asc' }, { houseNumber: 'asc' }],
    });

    console.log(
      `\n🏠 CASAS EN EL CONDOMINIO (${housesWithCharges.length} disponibles):`,
    );
    console.log(
      '-------------------------------------------------------------',
    );
    housesWithCharges.forEach((h, idx) => {
      const primaryResident = h.residents?.[0]?.user;
      const resName = primaryResident
        ? `${primaryResident.firstName} ${primaryResident.lastName}`.trim()
        : 'Sin residente';
      const paidCharges = h.maintenanceCharges.filter(
        (c) => c.status === 'PAID' || Number(c.paidAmount) > 0,
      ).length;
      const paidNote =
        paidCharges > 0
          ? `(${paidCharges} mes${paidCharges === 1 ? '' : 'es'} pagado${paidCharges === 1 ? '' : 's'})`
          : '(Sin pagos)';

      console.log(
        `  [${idx + 1}] Casa ${h.houseNumber}${h.tower ? ` (Torre ${h.tower})` : ''} - ${resName} ${paidNote}`,
      );
    });

    const ans = (
      await rl.question(
        `\n👉 Selecciona el número de lista [1-${housesWithCharges.length}] o escribe número de casa (ej: "1", "36"): `,
      )
    ).trim();

    const chosenIdx = parseInt(ans, 10) - 1;
    if (
      !isNaN(chosenIdx) &&
      chosenIdx >= 0 &&
      chosenIdx < housesWithCharges.length
    ) {
      selectedHouse = housesWithCharges[chosenIdx];
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
                {
                  houseNumber: {
                    equals: `Casa ${ans.replace(/^casa\s+/i, '')}`,
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
  const residentFullName =
    primaryResident && (primaryResident.firstName || primaryResident.lastName)
      ? `${primaryResident.firstName ?? ''} ${primaryResident.lastName ?? ''}`.trim()
      : 'Sin residente asignado';

  const houseDisplay = selectedHouse.houseNumber.startsWith('Casa')
    ? selectedHouse.houseNumber
    : `Casa ${selectedHouse.houseNumber}`;

  console.log(
    `\n✅ Vivienda seleccionada: ${houseDisplay}${
      selectedHouse.tower ? ` (Torre ${selectedHouse.tower})` : ''
    } - Residente: ${residentFullName}`,
  );

  // 3. SELECCIÓN DEL MES Y AÑO A REINICIAR
  // Cargar todos los cargos de mantenimiento de la vivienda
  const houseCharges = await prisma.maintenanceCharge.findMany({
    where: {
      houseId: selectedHouse.id,
      condominiumId: selectedCondo.id,
    },
    include: {
      maintenancePeriod: true,
      payments: {
        include: { createdBy: true },
        orderBy: { paymentDate: 'desc' },
      },
      lateFees: true,
    },
    orderBy: { dueDate: 'desc' },
  });

  if (houseCharges.length === 0) {
    console.log(
      `\nℹ️  La Casa ${selectedHouse.houseNumber} no tiene cargos de mantenimiento generados.`,
    );
    rl.close();
    process.exit(0);
  }

  let targetCharge: (typeof houseCharges)[0] | null = null;

  // Si se proporcionó un ID de pago o folio directo:
  if (paymentArg) {
    targetCharge =
      houseCharges.find((c) =>
        c.payments.some(
          (p) =>
            p.id === paymentArg ||
            p.receiptFolio?.toLowerCase() === paymentArg.toLowerCase(),
        ),
      ) || null;
  }

  // Si se proporcionaron mes y año por argumentos:
  if (!targetCharge && monthArg) {
    const parsedM = parseMonth(monthArg);
    const parsedY = yearArg ? parseInt(yearArg, 10) : new Date().getFullYear();

    if (parsedM) {
      targetCharge =
        houseCharges.find((c) => {
          if (c.maintenancePeriod) {
            return (
              c.maintenancePeriod.month === parsedM &&
              (!parsedY || c.maintenancePeriod.year === parsedY)
            );
          }
          const d = new Date(c.dueDate);
          return (
            d.getMonth() + 1 === parsedM &&
            (!parsedY || d.getFullYear() === parsedY)
          );
        }) || null;

      if (!targetCharge) {
        console.warn(
          `⚠️  No se encontró un cargo para el mes ${parsedM} año ${parsedY}.\n`,
        );
      }
    }
  }

  // Si aún no se ha seleccionado el cargo/periodo, mostrar lista interactiva
  while (!targetCharge) {
    console.log(
      `\n📅 PERIODOS Y CUOTAS DE CASA ${selectedHouse.houseNumber} (${houseCharges.length} registrados):`,
    );
    console.log(
      '-------------------------------------------------------------',
    );

    houseCharges.forEach((c, idx) => {
      const periodLabel = c.maintenancePeriod
        ? `${MONTH_NAMES[c.maintenancePeriod.month - 1] || 'Mes ' + c.maintenancePeriod.month} ${c.maintenancePeriod.year}`
        : c.concept;
      const amountStr = `$${Number(c.amount).toLocaleString('es-MX')}`;
      const paidStr = `$${Number(c.paidAmount || 0).toLocaleString('es-MX')}`;
      const pCount = c.payments.length;
      const statusBadge =
        c.status === 'PAID'
          ? '🟢 PAGADO'
          : c.status === 'PARTIAL'
            ? '🟡 PARCIAL'
            : c.status === 'OVERDUE'
              ? '🔴 VENCIDO'
              : '⚪ PENDIENTE';

      console.log(
        `  [${idx + 1}] ${periodLabel} — ${statusBadge} | Cuota: ${amountStr} | Pagado: ${paidStr} | ${pCount} pago${pCount === 1 ? '' : 's'}`,
      );
      if (pCount > 0) {
        c.payments.forEach((p) => {
          const fStr = p.receiptFolio
            ? `Folio: ${p.receiptFolio}`
            : 'Sin folio';
          const rStr = p.receiptUrl ? '(con recibo R2)' : '';
          console.log(
            `      💳 Pago $${Number(p.amount).toLocaleString('es-MX')} [${p.paymentMethod}] ${fStr} ${rStr}`,
          );
        });
      }
      if (c.proofUrl) {
        console.log(`      📎 Comprobante adjunto por residente en R2`);
      }
    });

    // Encontrar índice sugerido: primer cargo que esté PAGADO o tenga pagos
    const suggestedIdx = houseCharges.findIndex(
      (c) => c.status === 'PAID' || c.payments.length > 0,
    );
    const defaultIdx = suggestedIdx !== -1 ? suggestedIdx : 0;

    const ans = (
      await rl.question(
        `\n👉 Selecciona el periodo a reiniciar [${defaultIdx + 1}] o escribe mes y año (ej: "9 2026", "septiembre 2026"): `,
      )
    ).trim();

    if (ans === '') {
      targetCharge = houseCharges[defaultIdx];
      break;
    }

    const chosenIdx = parseInt(ans, 10) - 1;
    if (
      !isNaN(chosenIdx) &&
      chosenIdx >= 0 &&
      chosenIdx < houseCharges.length
    ) {
      targetCharge = houseCharges[chosenIdx];
      break;
    }

    // Intentar parsear entrada de texto tipo "septiembre 2026" o "9 2026"
    const parts = ans.split(/[\s\/-]+/);
    const userMonth = parseMonth(parts[0]) || parseMonth(parts[1]);
    const userYear =
      parseInt(parts.find((p) => /^\d{4}$/.test(p)) || '', 10) ||
      new Date().getFullYear();

    if (userMonth) {
      targetCharge =
        houseCharges.find((c) => {
          if (c.maintenancePeriod) {
            return (
              c.maintenancePeriod.month === userMonth &&
              c.maintenancePeriod.year === userYear
            );
          }
          const d = new Date(c.dueDate);
          return d.getMonth() + 1 === userMonth && d.getFullYear() === userYear;
        }) || null;
    }

    if (!targetCharge) {
      console.log(
        '❌ No se encontró cargo para esa opción o fecha. Intenta de nuevo.',
      );
    }
  }

  const periodDisplayName = targetCharge.maintenancePeriod
    ? `${MONTH_NAMES[targetCharge.maintenancePeriod.month - 1]} ${targetCharge.maintenancePeriod.year}`
    : targetCharge.concept;

  // 4. CÁLCULO DE IMPACTO Y RECOLECCIÓN DE ARCHIVOS
  const paymentsToDelete = targetCharge.payments;
  const totalPaidAmount = Number(targetCharge.paidAmount || 0);
  const baseChargeAmount = Number(targetCharge.amount);

  // Recolectar archivos de Cloudflare R2 a eliminar
  const r2KeysToDelete: string[] = [];
  for (const p of paymentsToDelete) {
    if (p.receiptUrl) {
      const key = cleanStorageKey(p.receiptUrl);
      if (key && !r2KeysToDelete.includes(key)) {
        r2KeysToDelete.push(key);
      }
    }
  }
  if (targetCharge.proofUrl) {
    const key = cleanStorageKey(targetCharge.proofUrl);
    if (key && !r2KeysToDelete.includes(key)) {
      r2KeysToDelete.push(key);
    }
  }

  // Detectar saldo a favor generado por estos pagos
  const excessMovements = await prisma.accountMovement.findMany({
    where: {
      houseId: selectedHouse.id,
      type: AccountMovementType.CREDIT,
      description: {
        contains: targetCharge.concept,
      },
    },
  });
  const excessToRevert = excessMovements.reduce(
    (sum, m) => sum + Number(m.amount),
    0,
  );

  console.log(
    '\n=============================================================',
  );
  console.log('📊 RESUMEN DE REINICIO DE MES DE PAGO:');
  console.log('=============================================================');
  console.log(
    ` • Condominio:          ${selectedCondo.name} (${selectedCondo.key})`,
  );
  console.log(` • Vivienda:            ${houseDisplay} (${residentFullName})`);
  console.log(` • Periodo a reiniciar: ${periodDisplayName}`);
  console.log(` • Cargo ID:            ${targetCharge.id}`);
  console.log(
    ` • Estatus actual:      ${targetCharge.status} (Pagado: $${totalPaidAmount.toLocaleString('es-MX')} MXN)`,
  );
  console.log(
    ` • Cuota base:          $${baseChargeAmount.toLocaleString('es-MX')} MXN`,
  );
  console.log(` • Pagos a eliminar:    ${paymentsToDelete.length} registro(s)`);

  paymentsToDelete.forEach((p, idx) => {
    console.log(
      `     [${idx + 1}] ID: ${p.id} | $${Number(p.amount).toLocaleString('es-MX')} MXN | ${p.paymentMethod} | Folio: ${p.receiptFolio || 'S/F'}`,
    );
  });

  if (targetCharge.lateFees.length > 0) {
    const totalLate = targetCharge.lateFees.reduce(
      (s, f) => s + Number(f.amount),
      0,
    );
    console.log(
      ` • Recargos por mora:   Se eliminarán $${totalLate.toLocaleString('es-MX')} MXN (${targetCharge.lateFees.length} registro/s)`,
    );
  }

  if (excessToRevert > 0) {
    console.log(
      ` • Saldo a favor:       Se revertirán $${excessToRevert.toLocaleString('es-MX')} MXN de la cuenta de la vivienda`,
    );
  }

  if (r2KeysToDelete.length > 0) {
    console.log(` • Archivos R2 a purgar:${r2KeysToDelete.length} archivo(s):`);
    r2KeysToDelete.forEach((k) => console.log(`     - ${k}`));
    if (keepReceipt) {
      console.log(
        '     ℹ️  (--keep-receipt activo: se conservarán los archivos en Cloudflare R2)',
      );
    }
  }

  console.log('-------------------------------------------------------------');
  console.log('🎯 ESTADO RESULTANTE TRAS EL REINICIO:');
  console.log(' • Estatus del cargo:    ➡️  PENDING (Pendiente de Pago)');
  console.log(' • Monto pagado:         ➡️  $0.00 MXN');
  console.log(
    ' • Comprobantes/Notas:   ➡️  Limpios (listo para volver a subir o registrar pago)',
  );
  console.log(
    '=============================================================\n',
  );

  if (isDryRun) {
    console.log(
      '🔍 [MODO DRY-RUN ACTIVO]: No se guardará ningún cambio en BD ni R2.',
    );
    rl.close();
    process.exit(0);
  }

  // 5. CONFIRMACIÓN INTERACTIVA
  if (!isYes) {
    const confirmation = await rl.question(
      `⚠️  ¿Confirmas reiniciar el mes de pago de ${houseDisplay} para ${periodDisplayName}? (escribe 'SI' para confirmar): `,
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

  console.log('\n🚀 Procesando reinicio en base de datos...');

  // 6. TRANSACCIÓN ATÓMICA EN POSTGRESQL
  await prisma.$transaction(async (tx) => {
    // A. Revertir saldo a favor si hubo excedentes acreditados
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

    // B. Eliminar recargos por mora asociados
    if (targetCharge.lateFees.length > 0) {
      await tx.lateFee.deleteMany({
        where: { maintenanceChargeId: targetCharge.id },
      });
      console.log(
        `   🧹 ${targetCharge.lateFees.length} recargo(s) por mora eliminado(s).`,
      );
    }

    // C. Eliminar los registros de Payment asociados a este cargo
    if (paymentsToDelete.length > 0) {
      await tx.payment.deleteMany({
        where: { maintenanceChargeId: targetCharge.id },
      });
      console.log(
        `   💳 ${paymentsToDelete.length} registro(s) de pago eliminado(s).`,
      );
    }

    // D. Reiniciar completamente el cargo de mantenimiento a PENDING
    await tx.maintenanceCharge.update({
      where: { id: targetCharge.id },
      data: {
        paidAmount: 0,
        status: MaintenanceChargeStatus.PENDING,
        notes: null,
        proofUrl: null,
        proofFileName: null,
        proofUploadedAt: null,
        proofReference: null,
        proofNotes: null,
      },
    });
    console.log(
      `   📋 Cargo "${periodDisplayName}" reiniciado exitosamente a estatus "PENDING" con $0 pagados.`,
    );
  });

  // 7. ELIMINACIÓN FÍSICA EN CLOUDFLARE R2
  if (r2KeysToDelete.length > 0 && !keepReceipt) {
    console.log(`\n🗑️  Eliminando comprobantes y recibos de Cloudflare R2...`);
    for (const key of r2KeysToDelete) {
      const ok = await deleteFromR2(key);
      if (ok) {
        console.log(`   ✅ Eliminado de R2: ${key}`);
      }
    }
  }

  console.log(
    '\n=============================================================',
  );
  console.log(
    `✨ REINICIO COMPLETADO CON ÉXITO para ${houseDisplay} (${periodDisplayName})`,
  );
  console.log('   La cuota ahora está en estatus PENDIENTE ($0 pagados).');
  console.log(
    '   Ya puedes volver a cargar o registrar el pago desde la plataforma.',
  );
  console.log(
    '=============================================================\n',
  );
}

main()
  .catch((err) => {
    console.error('\n❌ Ocurrió un error inesperado:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
