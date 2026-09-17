import 'dotenv/config';
import { PrismaClient } from '../src/core/infrastructure/persistence/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const emailOrUserId = process.argv[2];

  if (!emailOrUserId) {
    console.error('❌ Debes proporcionar el email o ID del residente.');
    console.error('Uso: npx tsx scripts/delete-resident.ts <email_o_userId>');
    process.exit(1);
  }

  console.log(`🔍 Buscando residente con identificador: ${emailOrUserId}...`);

  // 1. Encontrar usuario
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrUserId }, { id: emailOrUserId }],
    },
    include: {
      residentProfile: {
        include: {
          house: true,
        },
      },
    },
  });

  if (!user) {
    console.error(`❌ No se encontró ningún usuario con: ${emailOrUserId}`);
    process.exit(1);
  }

  if (user.role === 'ADMIN') {
    console.error(
      `🛑 Operación cancelada: El usuario ${user.email} tiene rol ADMIN.`,
    );
    console.error(
      'Este script solo debe usarse para eliminar residentes y sus casas.',
    );
    process.exit(1);
  }

  console.log(`👤 Usuario encontrado: ${user.email} (ID: ${user.id})`);

  // 2. Obtener casas asociadas
  const targetHouseIds: string[] = [];
  if (user.residentProfile?.houseId) {
    targetHouseIds.push(user.residentProfile.houseId);
  }

  // Buscar si tiene más perfiles o casas
  const additionalProfiles = await prisma.residentProfile.findMany({
    where: { userId: user.id },
    select: { houseId: true },
  });
  for (const p of additionalProfiles) {
    if (p.houseId && !targetHouseIds.includes(p.houseId)) {
      targetHouseIds.push(p.houseId);
    }
  }

  console.log(
    `🏠 Casas asociadas a eliminar: ${targetHouseIds.length > 0 ? targetHouseIds.join(', ') : 'Ninguna'}`,
  );

  // 3. Obtener todos los usuarios asociados a esas casas (miembros de familia/inquilinos)
  const targetUserIds: string[] = [user.id];
  if (targetHouseIds.length > 0) {
    const coResidents = await prisma.residentProfile.findMany({
      where: { houseId: { in: targetHouseIds } },
      select: { userId: true },
    });
    for (const r of coResidents) {
      if (r.userId && !targetUserIds.includes(r.userId)) {
        targetUserIds.push(r.userId);
      }
    }
  }

  console.log(
    `👥 Total de usuarios vinculados a eliminar: ${targetUserIds.length}`,
  );

  console.log('\n⚠️  INICIANDO ELIMINACIÓN EN CASCADA COMPLETA...');

  await prisma.$transaction(async (tx) => {
    // 4. AccessLog
    let logsDeleted = 0;
    if (targetHouseIds.length > 0) {
      const visitors = await tx.visitor.findMany({
        where: { houseId: { in: targetHouseIds } },
        select: { id: true },
      });
      const visitorIds = visitors.map((v) => v.id);

      const authorizations = await tx.accessAuthorization.findMany({
        where: { visitorId: { in: visitorIds } },
        select: { id: true },
      });
      const authIds = authorizations.map((a) => a.id);

      const resLogs = await tx.accessLog.deleteMany({
        where: {
          OR: [
            { accessAuthorizationId: { in: authIds } },
            { userAcceptId: { in: targetUserIds } },
          ],
        },
      });
      logsDeleted = resLogs.count;

      // 5. AccessAuthorization
      const resAuth = await tx.accessAuthorization.deleteMany({
        where: { visitorId: { in: visitorIds } },
      });
      console.log(`   - Autorizaciones de acceso eliminadas: ${resAuth.count}`);

      // 6. Visitor
      const resVis = await tx.visitor.deleteMany({
        where: { houseId: { in: targetHouseIds } },
      });
      console.log(`   - Visitantes eliminados: ${resVis.count}`);
    }
    console.log(`   - Logs de acceso eliminados: ${logsDeleted}`);

    // 7. ParcelDelivery
    const resParcels = await tx.parcelDelivery.deleteMany({
      where: {
        OR: [
          ...(targetHouseIds.length > 0
            ? [{ houseId: { in: targetHouseIds } }]
            : []),
          { receivedById: { in: targetUserIds } },
          { deliveredById: { in: targetUserIds } },
        ],
      },
    });
    console.log(`   - Paquetería eliminada: ${resParcels.count}`);

    // 8. MaintenanceCharges, Payments, LateFees
    if (targetHouseIds.length > 0) {
      const charges = await tx.maintenanceCharge.findMany({
        where: { houseId: { in: targetHouseIds } },
        select: { id: true },
      });
      const chargeIds = charges.map((c) => c.id);

      const resPay = await tx.payment.deleteMany({
        where: {
          OR: [
            { maintenanceChargeId: { in: chargeIds } },
            { createdById: { in: targetUserIds } },
          ],
        },
      });
      console.log(`   - Pagos eliminados: ${resPay.count}`);

      const resLate = await tx.lateFee.deleteMany({
        where: { maintenanceChargeId: { in: chargeIds } },
      });
      console.log(`   - Recargos moratorios eliminados: ${resLate.count}`);

      const resCharges = await tx.maintenanceCharge.deleteMany({
        where: { houseId: { in: targetHouseIds } },
      });
      console.log(
        `   - Cargos de mantenimiento eliminados: ${resCharges.count}`,
      );

      // 9. AccountMovement, HouseAccount, HouseConfiguration
      const resMov = await tx.accountMovement.deleteMany({
        where: { houseId: { in: targetHouseIds } },
      });
      console.log(`   - Movimientos contables eliminados: ${resMov.count}`);

      const resAcc = await tx.houseAccount.deleteMany({
        where: { houseId: { in: targetHouseIds } },
      });
      console.log(`   - Cuentas de casa eliminadas: ${resAcc.count}`);

      const resConf = await tx.houseConfiguration.deleteMany({
        where: { houseId: { in: targetHouseIds } },
      });
      console.log(`   - Configuración de casa eliminada: ${resConf.count}`);
    }

    // 10. PushSubscription, UserSession, PasswordResetToken
    const resPush = await tx.pushSubscription.deleteMany({
      where: { userId: { in: targetUserIds } },
    });
    console.log(`   - Suscripciones push eliminadas: ${resPush.count}`);

    const resSess = await tx.userSession.deleteMany({
      where: { userId: { in: targetUserIds } },
    });
    console.log(`   - Sesiones activas eliminadas: ${resSess.count}`);

    const resTokens = await tx.passwordResetToken.deleteMany({
      where: { userId: { in: targetUserIds } },
    });
    console.log(`   - Tokens de reseteo eliminados: ${resTokens.count}`);

    // 11. ResidentProfile
    const resProf = await tx.residentProfile.deleteMany({
      where: {
        OR: [
          ...(targetHouseIds.length > 0
            ? [{ houseId: { in: targetHouseIds } }]
            : []),
          { userId: { in: targetUserIds } },
        ],
      },
    });
    console.log(`   - Perfiles de residente eliminados: ${resProf.count}`);

    // 12. Houses
    if (targetHouseIds.length > 0) {
      const resHouses = await tx.house.deleteMany({
        where: { id: { in: targetHouseIds } },
      });
      console.log(`   - Casas eliminadas: ${resHouses.count}`);
    }

    // 13. Users
    const resUsers = await tx.user.deleteMany({
      where: { id: { in: targetUserIds } },
    });
    console.log(`   - Usuarios eliminados: ${resUsers.count}`);
  });

  console.log(
    '\n✅ ¡Eliminación en cascada completada exitosamente! No quedó ningún rastro.',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error durante la eliminación:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
