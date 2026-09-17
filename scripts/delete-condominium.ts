import 'dotenv/config';
import { PrismaClient } from '../src/core/infrastructure/persistence/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const searchTerm = process.argv[2];

  if (!searchTerm) {
    console.error(
      '❌ Debes proporcionar el key, ID o nombre del condominio/residencial.',
    );
    console.error(
      'Uso: npx tsx scripts/delete-condominium.ts <key_o_id_o_nombre>',
    );
    process.exit(1);
  }

  console.log(`🔍 Buscando condominio/residencial con: "${searchTerm}"...`);

  // 1. Buscar el condominio
  const condo = await prisma.condominium.findFirst({
    where: {
      OR: [
        { id: searchTerm },
        { key: searchTerm },
        { name: { equals: searchTerm, mode: 'insensitive' } },
      ],
    },
    include: {
      houses: true,
      admins: true,
    },
  });

  if (!condo) {
    console.error(
      `❌ No se encontró ningún condominio con el término: "${searchTerm}"`,
    );
    process.exit(1);
  }

  console.log(
    `🏢 Condominio encontrado: "${condo.name}" (Key: ${condo.key} | ID: ${condo.id})`,
  );

  // 2. Obtener todas las casas del condominio
  const houses = await prisma.house.findMany({
    where: { condominiumId: condo.id },
    select: { id: true, houseNumber: true },
  });
  const houseIds = houses.map((h) => h.id);
  console.log(`🏠 Casas encontradas en el residencial: ${houses.length}`);

  // 3. Obtener perfiles de residentes
  const residentProfiles = await prisma.residentProfile.findMany({
    where: {
      OR: [
        { condominiumId: condo.id },
        ...(houseIds.length > 0 ? [{ houseId: { in: houseIds } }] : []),
      ],
    },
    select: { id: true, userId: true },
  });
  const residentUserIds = residentProfiles
    .map((rp) => rp.userId)
    .filter(Boolean);

  // 4. Obtener usuarios asociados al condominio (admins, guardias/stand, personal)
  const staffUsers = await prisma.user.findMany({
    where: { condominiumId: condo.id },
    select: { id: true, email: true, role: true },
  });
  const staffUserIds = staffUsers.map((u) => u.id);

  // Unificar todos los usuarios que pertenecen exclusivamente a este condominio
  const allUserIds = Array.from(new Set([...residentUserIds, ...staffUserIds]));
  console.log(
    `👥 Total de usuarios (administradores, caseta, residentes) a eliminar: ${allUserIds.length}`,
  );

  console.log(
    '\n⚠️  INICIANDO ELIMINACIÓN TOTAL EN CASCADA DEL RESIDENCIAL...',
  );

  await prisma.$transaction(async (tx) => {
    // 5. AccessLog
    let logsDeleted = 0;
    if (houseIds.length > 0 || allUserIds.length > 0) {
      const visitors = await tx.visitor.findMany({
        where: { houseId: { in: houseIds } },
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
            ...(authIds.length > 0
              ? [{ accessAuthorizationId: { in: authIds } }]
              : []),
            ...(allUserIds.length > 0
              ? [{ userAcceptId: { in: allUserIds } }]
              : []),
          ],
        },
      });
      logsDeleted = resLogs.count;

      // 6. AccessAuthorization
      if (visitorIds.length > 0) {
        const resAuth = await tx.accessAuthorization.deleteMany({
          where: { visitorId: { in: visitorIds } },
        });
        console.log(
          `   - Autorizaciones de acceso eliminadas: ${resAuth.count}`,
        );
      }

      // 7. Visitor
      if (houseIds.length > 0) {
        const resVis = await tx.visitor.deleteMany({
          where: { houseId: { in: houseIds } },
        });
        console.log(`   - Visitantes eliminados: ${resVis.count}`);
      }
    }
    console.log(`   - Logs de acceso eliminados: ${logsDeleted}`);

    // 8. ParcelDelivery
    const resParcels = await tx.parcelDelivery.deleteMany({
      where: {
        OR: [
          { condominiumId: condo.id },
          ...(houseIds.length > 0 ? [{ houseId: { in: houseIds } }] : []),
          ...(allUserIds.length > 0
            ? [{ receivedById: { in: allUserIds } }]
            : []),
          ...(allUserIds.length > 0
            ? [{ deliveredById: { in: allUserIds } }]
            : []),
        ],
      },
    });
    console.log(`   - Paquetería eliminada: ${resParcels.count}`);

    // 9. Pagos y Recargos
    const charges = await tx.maintenanceCharge.findMany({
      where: {
        OR: [
          { condominiumId: condo.id },
          ...(houseIds.length > 0 ? [{ houseId: { in: houseIds } }] : []),
        ],
      },
      select: { id: true },
    });
    const chargeIds = charges.map((c) => c.id);

    const resPay = await tx.payment.deleteMany({
      where: {
        OR: [
          ...(chargeIds.length > 0
            ? [{ maintenanceChargeId: { in: chargeIds } }]
            : []),
          ...(allUserIds.length > 0
            ? [{ createdById: { in: allUserIds } }]
            : []),
        ],
      },
    });
    console.log(`   - Pagos eliminados: ${resPay.count}`);

    if (chargeIds.length > 0) {
      const resLate = await tx.lateFee.deleteMany({
        where: { maintenanceChargeId: { in: chargeIds } },
      });
      console.log(`   - Recargos moratorios eliminados: ${resLate.count}`);
    }

    // 10. Cargos de Mantenimiento
    const resCharges = await tx.maintenanceCharge.deleteMany({
      where: {
        OR: [
          { condominiumId: condo.id },
          ...(houseIds.length > 0 ? [{ houseId: { in: houseIds } }] : []),
        ],
      },
    });
    console.log(`   - Cargos de mantenimiento eliminados: ${resCharges.count}`);

    // 11. Periodos de mantenimiento
    const resPeriods = await tx.maintenancePeriod.deleteMany({
      where: { condominiumId: condo.id },
    });
    console.log(
      `   - Periodos de mantenimiento eliminados: ${resPeriods.count}`,
    );

    // 12. Movimientos contables, Cuentas y Configuración de casas
    if (houseIds.length > 0) {
      const resMov = await tx.accountMovement.deleteMany({
        where: { houseId: { in: houseIds } },
      });
      console.log(`   - Movimientos contables eliminados: ${resMov.count}`);

      const resAcc = await tx.houseAccount.deleteMany({
        where: { houseId: { in: houseIds } },
      });
      console.log(`   - Cuentas de casa eliminadas: ${resAcc.count}`);

      const resConf = await tx.houseConfiguration.deleteMany({
        where: { houseId: { in: houseIds } },
      });
      console.log(`   - Configuraciones de casa eliminadas: ${resConf.count}`);
    }

    // 13. Push, Sesiones, Tokens de los usuarios
    if (allUserIds.length > 0) {
      const resPush = await tx.pushSubscription.deleteMany({
        where: { userId: { in: allUserIds } },
      });
      console.log(`   - Suscripciones push eliminadas: ${resPush.count}`);

      const resSess = await tx.userSession.deleteMany({
        where: { userId: { in: allUserIds } },
      });
      console.log(`   - Sesiones eliminadas: ${resSess.count}`);

      const resTokens = await tx.passwordResetToken.deleteMany({
        where: { userId: { in: allUserIds } },
      });
      console.log(`   - Tokens de reseteo eliminados: ${resTokens.count}`);
    }

    // 14. Perfiles de residente
    const resProf = await tx.residentProfile.deleteMany({
      where: {
        OR: [
          { condominiumId: condo.id },
          ...(houseIds.length > 0 ? [{ houseId: { in: houseIds } }] : []),
          ...(allUserIds.length > 0 ? [{ userId: { in: allUserIds } }] : []),
        ],
      },
    });
    console.log(`   - Perfiles de residente eliminados: ${resProf.count}`);

    // 15. Casas
    if (houseIds.length > 0) {
      const resHouses = await tx.house.deleteMany({
        where: { id: { in: houseIds } },
      });
      console.log(`   - Casas eliminadas: ${resHouses.count}`);
    }

    // 16. Usuarios (Admins, Caseta, Residentes del condominio)
    if (allUserIds.length > 0) {
      const resUsers = await tx.user.deleteMany({
        where: { id: { in: allUserIds } },
      });
      console.log(`   - Cuentas de usuario eliminadas: ${resUsers.count}`);
    }

    // 17. El Condominio
    await tx.condominium.delete({
      where: { id: condo.id },
    });
    console.log(`   - Condominio "${condo.name}" (${condo.key}) eliminado.`);
  });

  console.log(
    '\n✅ ¡Condominio y todas sus relaciones eliminadas con éxito! Cero rastro en la base de datos.',
  );
}

main()
  .catch((e) => {
    console.error('❌ Error durante la eliminación del condominio:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
