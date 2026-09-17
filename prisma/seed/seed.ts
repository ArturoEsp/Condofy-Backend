import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../../src/core/infrastructure/persistence/prisma/generated/client';
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

  // 1. Crear o actualizar el condominio 'Albero Residencial'
  const condoName = 'Albero Residencial';
  const condoKey = 'RESIDENCIAL_ALBERO';

  const condo = await prisma.condominium.upsert({
    where: { key: condoKey },
    update: {
      name: condoName,
      description:
        'Residencial privado de primer nivel con seguridad privada y áreas verdes.',
      googleMapsUrl: 'https://maps.google.com/?q=Albero+Residencial',
      address: 'Av. Principal #100, Fracc. Albero Residencial',
      contactPhone: '5512345678',
      contactEmail: 'administracion@alberoresidencial.com',
    },
    create: {
      name: condoName,
      key: condoKey,
      description:
        'Residencial privado de primer nivel con seguridad privada y áreas verdes.',
      googleMapsUrl: 'https://maps.google.com/?q=Albero+Residencial',
      address: 'Av. Principal #100, Fracc. Albero Residencial',
      contactPhone: '5512345678',
      contactEmail: 'administracion@alberoresidencial.com',
    },
  });

  console.log(`✅ Condominio configurado: ${condo.name} (Key: ${condo.key})`);

  // 2. Crear o actualizar el Administrador asignado al condominio
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      phone: '5512345678',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      condominiumId: condo.id,
    },
    create: {
      email: adminEmail,
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'Principal',
      phone: '5512345678',
      role: 'ADMIN',
      status: 'ACTIVE',
      isEmailVerified: true,
      condominiumId: condo.id,
    },
  });

  console.log(
    `✅ Administrador configurado con éxito bajo el correo: ${admin.email}`,
  );

  // 3. Crear o actualizar el usuario de caseta/guardia
  const guardEmail = 'guardia@condofy.com';
  const guardPassword = await bcrypt.hash('guardia1234', 10);

  await prisma.user.upsert({
    where: { email: guardEmail },
    update: {
      passwordHash: guardPassword,
      role: 'STAND',
      status: 'ACTIVE',
      isEmailVerified: true,
      condominiumId: condo.id,
    },
    create: {
      email: guardEmail,
      passwordHash: guardPassword,
      role: 'STAND',
      status: 'ACTIVE',
      isEmailVerified: true,
      condominiumId: condo.id,
    },
  });

  console.log(`✅ Guardia configurado: ${guardEmail} / guardia1234`);
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
