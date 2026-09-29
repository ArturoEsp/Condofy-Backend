import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import {
  PrismaClient,
  AuthorizationType,
  AuthorizationStatus,
} from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso:
  yarn fix:permanent-access [opciones]

Opciones:
  --dry-run   Muestra los pases permanentes afectados sin modificar la BD
  --yes, -y   Aplica la corrección directamente sin confirmación interactiva
  --help, -h  Muestra esta ayuda

Ejemplos:
  yarn fix:permanent-access --dry-run
  yarn fix:permanent-access
  yarn fix:permanent-access --yes
`);
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const isYes = args.includes('--yes') || args.includes('-y');
  const rl = readline.createInterface({ input, output });

  try {
    console.log(
      '\n=============================================================',
    );
    console.log('🛡️  CONDOFY - REPARACIÓN DE PASES PERMANENTES AFECTADOS');
    console.log(
      '=============================================================\n',
    );

    console.log(
      '🔍 Buscando pases de tipo PERMANENTE guardados con límite forzado (maxEntries = 1)...',
    );

    const affected = await prisma.accessAuthorization.findMany({
      where: {
        type: AuthorizationType.PERMANENT,
        maxEntries: 1,
      },
      include: {
        visitor: {
          include: {
            house: {
              include: {
                condominium: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (affected.length === 0) {
      console.log(
        '\n✅ No se encontraron pases permanentes afectados con límite 1. Todo está en orden.\n',
      );
      return;
    }

    console.log(
      `\n⚠️  Se encontraron ${affected.length} pase(s) permanente(s) afectados:\n`,
    );

    affected.forEach((item, idx) => {
      const code = `ACC-${String(item.index).padStart(4, '0')}`;
      const visitorName =
        `${item.visitor.firstName} ${item.visitor.lastName || ''}`.trim();
      const houseNumber = item.visitor.house?.houseNumber || 'N/A';
      const condoName = item.visitor.house?.condominium?.name || 'N/A';
      const statusText =
        item.status === AuthorizationStatus.USED
          ? '🔴 USED (Bloqueado por 1er uso)'
          : item.status === AuthorizationStatus.ACTIVE
            ? '🟡 ACTIVE (Pendiente de bloquearse al 1er uso)'
            : `⚪ ${item.status}`;

      console.log(
        ` [${idx + 1}] Pase: ${code} | PIN/QR: ${item.qrCode} | Estatus: ${statusText}`,
      );
      console.log(
        `     Visitante: ${visitorName} | Casa: ${houseNumber} (${condoName})`,
      );
      console.log(
        `     Entradas utilizadas: ${item.usedEntries} | Creado: ${item.createdAt.toISOString()}`,
      );
      console.log('');
    });

    const usedCount = affected.filter(
      (a) => a.status === AuthorizationStatus.USED,
    ).length;
    const activeCount = affected.filter(
      (a) => a.status === AuthorizationStatus.ACTIVE,
    ).length;

    console.log('📊 Resumen del diagnóstico:');
    console.log(`   - Pases actualmente bloqueados (USED): ${usedCount}`);
    console.log(
      `   - Pases activos que se bloquearían al 1er ingreso: ${activeCount}`,
    );
    console.log(`   - Total a sanar: ${affected.length}\n`);

    if (isDryRun) {
      console.log(
        'ℹ️  Modo --dry-run activo. No se realizaron cambios en la base de datos.\n',
      );
      return;
    }

    if (!isYes) {
      const answer = await rl.question(
        `¿Deseas corregir estos ${affected.length} pases eliminando el límite (maxEntries = NULL) y reactivando a ACTIVE los que estén en USED? (S/N): `,
      );
      if (
        answer.trim().toLowerCase() !== 's' &&
        answer.trim().toLowerCase() !== 'si' &&
        answer.trim().toLowerCase() !== 'y' &&
        answer.trim().toLowerCase() !== 'yes'
      ) {
        console.log('\n❌ Operación cancelada por el usuario.\n');
        return;
      }
    }

    console.log('\n⏳ Aplicando corrección en la base de datos...');

    const [reactivated, updatedRemaining] = await prisma.$transaction([
      // 1. Reactivar los que quedaron bloqueados en USED
      prisma.accessAuthorization.updateMany({
        where: {
          type: AuthorizationType.PERMANENT,
          maxEntries: 1,
          status: AuthorizationStatus.USED,
        },
        data: {
          maxEntries: null,
          status: AuthorizationStatus.ACTIVE,
        },
      }),
      // 2. A los demás (ACTIVE, etc.), quitarles el límite de 1 para que sean ilimitados
      prisma.accessAuthorization.updateMany({
        where: {
          type: AuthorizationType.PERMANENT,
          maxEntries: 1,
          status: {
            not: AuthorizationStatus.USED,
          },
        },
        data: {
          maxEntries: null,
        },
      }),
    ]);

    console.log(
      '\n=============================================================',
    );
    console.log('🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log(
      '=============================================================',
    );
    console.log(` ✅ Pases reactivados de USED a ACTIVE: ${reactivated.count}`);
    console.log(
      ` ✅ Pases activos corregidos a ilimitados: ${updatedRemaining.count}`,
    );
    console.log(
      ` 🚀 Total de pases permanentes ahora ilimitados: ${reactivated.count + updatedRemaining.count}\n`,
    );
  } catch (error) {
    console.error('\n❌ Ocurrió un error al ejecutar la corrección:', error);
    process.exit(1);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
