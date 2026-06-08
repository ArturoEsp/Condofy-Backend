import * as bcrypt from 'bcrypt';

import { PrismaClient } from '@/core/infrastructure/persistence/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  console.log('🌱 Iniciando la carga de datos...');

  const adminEmail = process.env.APP_ADMIN_EMAIL;
  const adminPassword = process.env.APP_ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      '❌ Error: Las variables APP_ADMIN_EMAIL o APP_ADMIN_PASSWORD no están definidas en el .env',
    );
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(
    `✅ Administrador configurado con éxito bajo el correo: ${admin.email}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e: unknown) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
