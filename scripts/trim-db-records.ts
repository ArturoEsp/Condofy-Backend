import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { PrismaClient } from '../src/core/infrastructure/persistence/prisma/generated/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Uso:
  yarn trim:records [opciones]

Opciones:
  --dry-run   Muestra los registros con espacios al inicio/final sin modificar la BD
  --yes, -y   Ejecuta la limpieza directamente sin pedir confirmación interactiva
  --help, -h  Muestra esta ayuda

Ejemplos:
  yarn trim:records --dry-run
  yarn trim:records
  yarn trim:records --yes
`);
    process.exit(0);
  }

  const isDryRun = args.includes('--dry-run');
  const isYes = args.includes('--yes') || args.includes('-y');
  const rl = readline.createInterface({ input, output });

  try {
    console.log(
      '\n🔍 Analizando base de datos en busca de campos con espacios innecesarios...\n',
    );

    // 1. Condominios
    const condos = await prisma.condominium.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        description: true,
        contactPhone: true,
        contactEmail: true,
      },
    });
    const dirtyCondos = condos.filter(
      (c) =>
        c.name !== c.name.trim() ||
        (c.address && c.address !== c.address.trim()) ||
        (c.description && c.description !== c.description.trim()) ||
        (c.contactPhone && c.contactPhone !== c.contactPhone.trim()) ||
        (c.contactEmail && c.contactEmail !== c.contactEmail.trim()),
    );

    // 2. Casas (House)
    const houses = await prisma.house.findMany({
      select: { id: true, condominiumId: true, houseNumber: true, tower: true },
    });
    const dirtyHouses = houses.filter(
      (h) =>
        h.houseNumber !== h.houseNumber.trim() ||
        (h.tower !== null &&
          h.tower !== undefined &&
          h.tower !== h.tower.trim()),
    );

    // 3. Residentes (ResidentProfile)
    const residentProfiles = await prisma.residentProfile.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        comments: true,
      },
    });
    const dirtyProfiles = residentProfiles.filter(
      (rp) =>
        rp.firstName !== rp.firstName.trim() ||
        rp.lastName !== rp.lastName.trim() ||
        (rp.phone && rp.phone !== rp.phone.trim()) ||
        (rp.comments && rp.comments !== rp.comments.trim()),
    );

    // 4. Usuarios (User)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });
    const dirtyUsers = users.filter(
      (u) =>
        (u.firstName && u.firstName !== u.firstName.trim()) ||
        (u.lastName && u.lastName !== u.lastName.trim()) ||
        u.email !== u.email.trim().toLowerCase() ||
        (u.phone && u.phone !== u.phone.trim()),
    );

    // 5. Visitantes (Visitor)
    const visitors = await prisma.visitor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        vehiclePlate: true,
      },
    });
    const dirtyVisitors = visitors.filter(
      (v) =>
        v.firstName !== v.firstName.trim() ||
        (v.lastName && v.lastName !== v.lastName.trim()) ||
        (v.phone && v.phone !== v.phone.trim()) ||
        (v.vehiclePlate && v.vehiclePlate !== v.vehiclePlate.trim()),
    );

    // 6. Configuración de Cobranza (CondominiumBillingConfig)
    const billingConfigs = await prisma.condominiumBillingConfig.findMany({
      select: {
        id: true,
        bankName: true,
        accountHolder: true,
        clabe: true,
        accountNumber: true,
      },
    });
    const dirtyBillingConfigs = billingConfigs.filter(
      (b) =>
        (b.bankName && b.bankName !== b.bankName.trim()) ||
        (b.accountHolder && b.accountHolder !== b.accountHolder.trim()) ||
        (b.clabe && b.clabe !== b.clabe.trim()) ||
        (b.accountNumber && b.accountNumber !== b.accountNumber.trim()),
    );

    const totalDirty =
      dirtyCondos.length +
      dirtyHouses.length +
      dirtyProfiles.length +
      dirtyUsers.length +
      dirtyVisitors.length +
      dirtyBillingConfigs.length;

    console.log('======================================================');
    console.log('       REPORTE DE REGISTROS CON ESPACIOS INICIALES/FINALES');
    console.log('======================================================');
    console.log(
      `🏢 Condominios afectados              : ${dirtyCondos.length}`,
    );
    console.log(
      `🏠 Casas (número/torre) afectadas     : ${dirtyHouses.length}`,
    );
    console.log(
      `👤 Perfiles de residente afectados    : ${dirtyProfiles.length}`,
    );
    console.log(`👥 Cuentas de usuario afectadas       : ${dirtyUsers.length}`);
    console.log(
      `🚗 Visitantes afectados               : ${dirtyVisitors.length}`,
    );
    console.log(
      `🏦 Datos bancarios/cobranza afectados : ${dirtyBillingConfigs.length}`,
    );
    console.log('------------------------------------------------------');
    console.log(`📊 TOTAL DE REGISTROS A CORREGIR      : ${totalDirty}`);
    console.log('======================================================\n');

    if (dirtyHouses.length > 0) {
      console.log('🏠 Muestra de casas con espacios:');
      dirtyHouses.slice(0, 10).forEach((h) => {
        console.log(
          `   - ID: ${h.id} | Número: "${h.houseNumber}" -> "${h.houseNumber.trim()}" | Torre: "${h.tower ?? ''}" -> "${h.tower ? h.tower.trim() : ''}"`,
        );
      });
      if (dirtyHouses.length > 10)
        console.log(`   ... y ${dirtyHouses.length - 10} más.\n`);
    }

    if (dirtyProfiles.length > 0) {
      console.log('👤 Muestra de residentes con espacios:');
      dirtyProfiles.slice(0, 10).forEach((rp) => {
        console.log(
          `   - ID: ${rp.id} | Nombre: "${rp.firstName}" -> "${rp.firstName.trim()}" | Apellido: "${rp.lastName}" -> "${rp.lastName.trim()}"`,
        );
      });
      if (dirtyProfiles.length > 10)
        console.log(`   ... y ${dirtyProfiles.length - 10} más.\n`);
    }

    if (dirtyCondos.length > 0) {
      console.log('🏢 Condominios con espacios en nombre/calle:');
      dirtyCondos.forEach((c) => {
        console.log(
          `   - ID: ${c.id} | Nombre: "${c.name}" -> "${c.name.trim()}" | Dirección: "${c.address ?? ''}" -> "${c.address ? c.address.trim() : ''}"`,
        );
      });
      console.log('');
    }

    if (totalDirty === 0) {
      console.log(
        '✨ ¡Excelente! No se encontraron registros con espacios al inicio o final en la base de datos.',
      );
      process.exit(0);
    }

    if (isDryRun) {
      console.log(
        '🔍 MODO SIMULACIÓN (--dry-run) FINALIZADO. No se aplicó ningún cambio.',
      );
      process.exit(0);
    }

    if (!isYes) {
      const answer = (
        await rl.question(
          "¿Deseas corregir y aplicar TRIM a estos registros en la base de datos? (Escribe 'SI' para proceder): ",
        )
      ).trim();

      if (answer !== 'SI' && answer !== 'si') {
        console.log(
          '\n🛑 Operación cancelada por el usuario. No se modificó la base de datos.',
        );
        process.exit(0);
      }
    }

    console.log('\n🚀 Aplicando limpieza y sanitización de espacios...');

    let updatedCondos = 0;
    let updatedHouses = 0;
    let updatedProfiles = 0;
    let updatedUsers = 0;
    let updatedVisitors = 0;
    let updatedBilling = 0;

    await prisma.$transaction(async (tx) => {
      // 1. Condominios
      for (const c of dirtyCondos) {
        await tx.condominium.update({
          where: { id: c.id },
          data: {
            name: c.name.trim(),
            address: c.address ? c.address.trim() : null,
            description: c.description ? c.description.trim() : null,
            contactPhone: c.contactPhone ? c.contactPhone.trim() : null,
            contactEmail: c.contactEmail
              ? c.contactEmail.trim().toLowerCase()
              : null,
          },
        });
        updatedCondos++;
      }

      // 2. Casas
      for (const h of dirtyHouses) {
        await tx.house.update({
          where: { id: h.id },
          data: {
            houseNumber: h.houseNumber.trim(),
            tower: h.tower ? h.tower.trim() : null,
          },
        });
        updatedHouses++;
      }

      // 3. Residentes
      for (const rp of dirtyProfiles) {
        await tx.residentProfile.update({
          where: { id: rp.id },
          data: {
            firstName: rp.firstName.trim(),
            lastName: rp.lastName.trim(),
            phone: rp.phone ? rp.phone.trim() : null,
            comments: rp.comments ? rp.comments.trim() : null,
          },
        });
        updatedProfiles++;
      }

      // 4. Usuarios
      for (const u of dirtyUsers) {
        await tx.user.update({
          where: { id: u.id },
          data: {
            firstName: u.firstName ? u.firstName.trim() : null,
            lastName: u.lastName ? u.lastName.trim() : null,
            email: u.email.trim().toLowerCase(),
            phone: u.phone ? u.phone.trim() : null,
          },
        });
        updatedUsers++;
      }

      // 5. Visitantes
      for (const v of dirtyVisitors) {
        await tx.visitor.update({
          where: { id: v.id },
          data: {
            firstName: v.firstName.trim(),
            lastName: v.lastName ? v.lastName.trim() : null,
            phone: v.phone ? v.phone.trim() : null,
            vehiclePlate: v.vehiclePlate ? v.vehiclePlate.trim() : null,
          },
        });
        updatedVisitors++;
      }

      // 6. Configuración de Cobranza
      for (const b of dirtyBillingConfigs) {
        await tx.condominiumBillingConfig.update({
          where: { id: b.id },
          data: {
            bankName: b.bankName ? b.bankName.trim() : null,
            accountHolder: b.accountHolder ? b.accountHolder.trim() : null,
            clabe: b.clabe ? b.clabe.trim() : null,
            accountNumber: b.accountNumber ? b.accountNumber.trim() : null,
          },
        });
        updatedBilling++;
      }
    });

    console.log('\n======================================================');
    console.log('✅ ¡LIMPIEZA DE ESPACIOS COMPLETADA EXITOSAMENTE!');
    console.log(`   - Condominios actualizados   : ${updatedCondos}`);
    console.log(`   - Casas actualizadas         : ${updatedHouses}`);
    console.log(`   - Residentes actualizados    : ${updatedProfiles}`);
    console.log(`   - Usuarios actualizados      : ${updatedUsers}`);
    console.log(`   - Visitantes actualizados    : ${updatedVisitors}`);
    console.log(`   - Configs bancarias limpias  : ${updatedBilling}`);
    console.log('======================================================\n');
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌ ERROR DURANTE LA LIMPIEZA:', err);
  process.exit(1);
});
