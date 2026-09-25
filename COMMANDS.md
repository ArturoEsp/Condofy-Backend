# 🛠️ Condofy - Guía de Comandos y Scripts Administrativos

Este documento contiene la referencia completa de los comandos de consola actuales, utilidades de mantenimiento para la base de datos y Cloudflare R2, su **ejecución tanto en entorno local como en Docker (producción)**, y la guía para la creación de **futuros scripts**.

---

## 📑 Índice

1. [Scripts Administrativos Actuales](#1-scripts-administrativos-actuales)
   - [`reset:billing` (Reinicio de Cobranza y Limpieza R2)](#resetbilling-reinicio-de-cobranza-y-limpieza-r2)
   - [`delete:payment` (Eliminación de Pago por Casa y Limpieza R2)](#deletepayment-eliminación-de-pago-por-casa-y-limpieza-r2)
   - [`delete:house` (Eliminación de Casa en Cascada y Limpieza R2)](#deletehouse-eliminación-de-casa-en-cascada-y-limpieza-r2)
   - [`delete:resident` (Eliminación de Residente en Cascada)](#deleteresident-eliminación-de-residente-en-cascada)
   - [`delete:condominium` (Eliminación de Condominio en Cascada)](#deletecondominium-eliminación-de-condominio-en-cascada)
   - [`trim:records` (Limpieza y Sanitización de Espacios en BD)](#trimrecords-limpieza-y-sanitización-de-espacios-en-bd)
2. [Comandos Frecuentes de Desarrollo y Base de Datos (Local vs Docker)](#2-comandos-frecuentes-de-desarrollo-y-base-de-datos-local-vs-docker)
3. [🐳 Guía Rápida de Ejecución con Docker (Producción / VPS)](#3--guía-rápida-de-ejecución-con-docker-producción--vps)
4. [Guía y Estándar para Crear Futuros Scripts](#4-guía-y-estándar-para-crear-futuros-scripts)
   - [Ubicación y Registro en `package.json`](#ubicación-y-registro-en-packagejson)
   - [Plantilla Base Recomendada](#plantilla-base-recomendada)
   - [Buenas Prácticas Contables y de Seguridad](#buenas-prácticas-contables-y-de-seguridad)

---

## 1. Scripts Administrativos Actuales

### `reset:billing` (Reinicio de Cobranza y Limpieza R2)

_Archivo:_ [`scripts/reset-billing-period.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/reset-billing-period.ts)

Permite reiniciar el proceso de carga de cuotas de un mes y año específico, revirtiendo pagos, limpiando recargos por mora y eliminando de forma permanente los comprobantes y recibos oficiales almacenados en **Cloudflare R2**.

#### ¿Qué acciones realiza?

1. **Cloudflare R2:** Elimina todos los archivos físicos (`receiptUrl` y `proofUrl`) alojados en el bucket `condofy-private`.
2. **Saldos a Favor:** Si algún pago registrado en ese mes generó excedente acreditado a `HouseAccount`, restaura el balance deduciendo el crédito para evitar inconsistencias contables.
3. **Pagos y Moras:** Elimina los registros en `Payment` y `LateFee`.
4. **Reinicio de Cuotas:** Devuelve los cargos de mantenimiento (`MaintenanceCharge`) a estatus **`PENDING`** con **`paidAmount: 0`**, limpiando notas y folios previos para permitir volver a cargar los pagos desde cero.

#### Sintaxis de uso:

##### A. Ejecución Directa (Local / Desarrollo en tu máquina):

```bash
# Modo 1: Interactivo (si no pasas argumentos, te preguntará el condominio, mes y año)
yarn reset:billing

# Modo 2: Parámetros directos (Condominio, Mes y Año en cualquier orden)
yarn reset:billing albero 9 2026
yarn reset:billing 9 2026 --condo albero
yarn reset:billing albero septiembre 2026

# Modo 3: Simulación previa (NO borra nada, lista archivos R2 y pagos encontrados)
yarn reset:billing albero 9 2026 --dry-run

# Modo 4: Desatendido / Automático (Sin confirmación 'SI')
yarn reset:billing albero 9 2026 --yes

# Modo 5: Eliminación total (elimina cargos y periodo por completo)
yarn reset:billing albero 9 2026 --hard-delete
```

##### B. Ejecución con Docker (En Servidor de Producción / VPS):

```bash
# Modo interactivo a través del contenedor activo (te preguntará condominio si no lo pasas):
docker compose -f docker-compose.prod.yml exec -it api yarn reset:billing

# Pasando condominio, mes y año directamente:
docker compose -f docker-compose.prod.yml exec -it api yarn reset:billing albero 9 2026

# Modo desatendido / directo para scripts automáticos:
docker compose -f docker-compose.prod.yml exec api yarn reset:billing albero 9 2026 --yes

# Simulación previa en producción (Dry-run):
docker compose -f docker-compose.prod.yml exec api yarn reset:billing albero 9 2026 --dry-run

# O ingresando a la shell interactiva del contenedor:
docker compose -f docker-compose.prod.yml exec -it api sh
# (y dentro del contenedor ejecutas directamente):
yarn reset:billing albero 9 2026
```

---

### `delete:payment` (Eliminación de Pago por Casa y Limpieza R2)

_Archivos:_

- TypeScript: [`scripts/delete-payment.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete-payment.ts)
- SQL Nativo: [`scripts/delete_payment.sql`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete_payment.sql)

Permite revertir y eliminar un pago registrado por error o duplicado de una vivienda, recalculando con rigor contable el adeudo de la cuota de mantenimiento, revirtiendo excedentes en la cuenta de la casa y purgando el comprobante o recibo digital alojado en **Cloudflare R2**.

#### ¿Qué acciones realiza en cascada y cómo recalcula?

1. **Recálculo de la Cuota (`MaintenanceCharge`):**
   - Resta el importe exacto del pago eliminado del campo `paidAmount` del cargo asociado.
   - Si la cuota ya no queda cubierta en su totalidad, transiciona su estado automáticamente:
     - **`PENDING`**: Si aún no vence la fecha límite de pago (`dueDate`).
     - **`OVERDUE`**: Si la fecha de vencimiento ya expiró.
     - **`PARTIAL`**: Si la cuota aún conserva otros abonos previos registrados.
2. **Reversión de Saldo a Favor (`HouseAccount` / `AccountMovement`):**
   - Si el pago eliminado había generado un crédito excedente registrado en la cuenta de la vivienda (cuando el residente pagó de más), descuenta dicho importe del saldo actual (`balance`) de `HouseAccount` y elimina el movimiento de crédito en `AccountMovement`.
3. **Cloudflare R2:**
   - Detecta la URL o clave del comprobante/recibo (`receiptUrl`) en el bucket `condofy-private` y lo elimina físicamente mediante la API de S3 (opcionalmente se puede conservar con la bandera `--keep-receipt`).
4. **Transacción Atómica PostgreSQL:**
   - La eliminación del registro `Payment`, la actualización de `MaintenanceCharge` y el ajuste de `HouseAccount` se ejecutan en un bloque transaccional atómico (`prisma.$transaction`). Si cualquier operación falla, la base de datos se revierte intacta.

#### Sintaxis de uso:

##### A. Ejecución Directa (Local / Desarrollo):

```bash
# Modo 1: Interactivo (te listará condominios, casas con pagos y el historial detallado del pago con folio, monto y cuota)
yarn delete:payment

# Modo 2: Parámetros posicionales (Condominio y Número de casa)
yarn delete:payment albero 101

# Modo 3: Parámetros posicionales completos (Condominio, Casa y Folio o ID del Pago)
yarn delete:payment albero 101 REC-101-839212

# Modo 4: Banderas CLI explícitas
yarn delete:payment --condo albero --house 101 --payment REC-101-839212

# Modo 5: Simulación previa (--dry-run: muestra el impacto contable y estado resultante sin modificar nada)
yarn delete:payment albero 101 REC-101-839212 --dry-run

# Modo 6: Desatendido / Automático (omite confirmación manual interactiva)
yarn delete:payment albero 101 REC-101-839212 --yes

# Modo 7: Conservar comprobante en Cloudflare R2 (solo borra registro contable y de BD)
yarn delete:payment albero 101 REC-101-839212 --keep-receipt
```

##### B. Ejecución con Docker (En Servidor de Producción / VPS):

```bash
# Modo interactivo asistido dentro del contenedor de la API:
docker compose -f docker-compose.prod.yml exec -it api yarn delete:payment

# Pasando condominio y casa de forma directa:
docker compose -f docker-compose.prod.yml exec -it api yarn delete:payment albero 101

# Simulación previa en producción (Dry-run):
docker compose -f docker-compose.prod.yml exec api yarn delete:payment albero 101 REC-101-839212 --dry-run

# Modo desatendido para pipelines o mantenimiento automatizado:
docker compose -f docker-compose.prod.yml exec api yarn delete:payment albero 101 REC-101-839212 --yes

# O mediante consola shell interactiva del contenedor:
docker compose -f docker-compose.prod.yml exec -it api sh
yarn delete:payment albero 101
```

##### C. Script SQL Directo (DBeaver / DataGrip / psql):

Si prefieres ejecutar la reversión manualmente en tu gestor de base de datos sin Node.js:

- Abre el archivo [`scripts/delete_payment.sql`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete_payment.sql).
- Sustituye la variable `'TU_PAYMENT_ID_AQUI'` en el bloque `DO $$ ... END $$;`.
- Ejecuta el script. Realizará las mismas comprobaciones, ajustes de saldo a favor, cálculo de estatus de cuota y eliminación segura dentro de una transacción SQL.

---

### `delete:house` (Eliminación de Casa en Cascada y Limpieza R2)

_Archivos:_

- TypeScript: [`scripts/delete-house.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete-house.ts)
- SQL Nativo: [`scripts/delete_house_cascade.sql`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete_house_cascade.sql)

Elimina de raíz una vivienda/casa creada de forma incorrecta, barriendo todas sus dependencias en cascada atómica y purgando cualquier archivo físico almacenado en **Cloudflare R2** para no dejar registros huérfanos ni consumo innecesario de almacenamiento.

#### ¿Qué elementos elimina en cascada?

1. **Cloudflare R2:** Elimina comprobantes de cuotas (`proofUrl`), recibos oficiales (`receiptUrl`), fotografías de paquetería en caseta (`photoUrl`) y fotos de visitantes (`photo`).
2. **Accesos y Seguridad:** Registros de bitácora (`AccessLog`), códigos QR y autorizaciones (`AccessAuthorization`), y visitantes registrados (`Visitor`).
3. **Caseta y Paquetería:** Todos los envíos recibidos o entregados para esa vivienda (`ParcelDelivery`).
4. **Finanzas y Cobranza:** Cargos de mantenimiento (`MaintenanceCharge`), pagos (`Payment`), recargos por mora (`LateFee`), movimientos contables (`AccountMovement`), cuenta de vivienda (`HouseAccount`) y su configuración (`HouseConfiguration`).
5. **Residentes y Cuentas de Usuario:**
   - Elimina perfiles de residente (`ResidentProfile`).
   - Si los usuarios asociados tenían rol `RESIDENT` y pertenecían **únicamente** a esta vivienda, se eliminan completamente sus sesiones (`UserSession`), tokens (`PasswordResetToken`), suscripciones (`PushSubscription`) y cuentas (`User`).
   - 🛡️ **Protección de Seguridad:** Si un usuario vinculado tiene rol `ADMIN` o `STAND`, o tiene casas adicionales asignadas, **NUNCA** se elimina su cuenta; únicamente se desvincula de la vivienda.
6. **Vivienda (`House`):** La casa es eliminada de forma definitiva del condominio.

#### Sintaxis de uso:

##### A. Ejecución Directa (Local / Desarrollo):

```bash
# Modo 1: Interactivo (te listará los condominios disponibles y pedirá el número de casa)
yarn delete:house

# Modo 2: Parámetros directos (Condominio y Número de casa)
yarn delete:house albero 102
yarn delete:house albero "Casa 38"
yarn delete:house --condo albero --house 102

# Modo 3: Por UUID directo de la casa
yarn delete:house b8f75c74-04b8-4f78-b76b-2ef31be740a7

# Modo 4: Simulación previa (--dry-run: lista TODO lo que borraría sin modificar nada)
yarn delete:house albero 102 --dry-run

# Modo 5: Desatendido / Automático (omite la confirmación manual 'SI')
yarn delete:house albero 102 --yes
```

##### B. Ejecución con Docker (En Servidor de Producción / VPS):

```bash
# Modo interactivo a través del contenedor de la API:
docker compose -f docker-compose.prod.yml exec -it api yarn delete:house

# Pasando condominio y número de casa directamente:
docker compose -f docker-compose.prod.yml exec -it api yarn delete:house albero 102

# Simulación previa en producción (Dry-run):
docker compose -f docker-compose.prod.yml exec api yarn delete:house albero 102 --dry-run

# Modo desatendido para pipelines o scripts de migración:
docker compose -f docker-compose.prod.yml exec api yarn delete:house albero 102 --yes

# O dentro de la consola del contenedor:
docker compose -f docker-compose.prod.yml exec -it api sh
yarn delete:house albero 102
```

---

### `delete:resident` (Eliminación de Residente en Cascada)

_Archivo:_ [`scripts/delete-resident.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/delete-resident.ts)

Elimina de forma segura un residente, sus perfiles, autorizaciones de acceso, registros de visitas, paquetes en caseta y sus viviendas asociadas (incluyendo co-residentes/inquilinos vinculados).

#### Validaciones de seguridad:

- Impide la eliminación accidental de usuarios con rol `ADMIN`.
- Se ejecuta dentro de una transacción atómica `prisma.$transaction`.

#### Sintaxis de uso:

##### A. Ejecución Directa (Local):

```bash
# Por correo electrónico
yarn delete:resident residente@correo.com

# Por UUID del usuario
yarn delete:resident 5207eaf3-268a-4603-a6b9-62e9cadf9365
```

##### B. Ejecución con Docker (Producción / VPS):

```bash
docker compose -f docker-compose.prod.yml exec api yarn delete:resident residente@correo.com
```

---

### `delete:condominium` (Eliminación de Condominio en Cascada)

_Archivo:_ [`prisma/scripts/delete-condominium.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/prisma/scripts/delete-condominium.ts)

Elimina un condominio completo y todas sus dependencias (viviendas, residentes, accesos, cuotas, amenidades y configuraciones).

#### Sintaxis de uso:

##### A. Ejecución Directa (Local):

```bash
yarn delete:condominium <condominiumId_o_clave>
```

##### B. Ejecución con Docker (Producción / VPS):

```bash
docker compose -f docker-compose.prod.yml exec api yarn delete:condominium <condominiumId_o_clave>
```

---

### `trim:records` (Limpieza y Sanitización de Espacios en BD)

_Archivos:_

- TypeScript: [`scripts/trim-db-records.ts`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/trim-db-records.ts)
- SQL Nativo: [`scripts/trim_database_records.sql`](file:///c:/Users/bmth_/OneDrive/Documentos/GitHub/Condofy-Backend/scripts/trim_database_records.sql)

Escanea y sanea la base de datos completa eliminando espacios en blanco accidentales al inicio o al final (`TRIM`) en campos de texto de:

- **Condominios:** Nombre, calle/dirección (`address`), descripción, teléfono y email de contacto.
- **Casas / Viviendas:** Número de casa (`houseNumber`) y torre (`tower`).
- **Residentes:** Nombres, apellidos, teléfono y comentarios.
- **Usuarios:** Nombres, apellidos, email (normalizado a minúsculas) y teléfono.
- **Visitantes:** Nombres, apellidos, teléfono y placa de vehículo.
- **Configuración Bancaria:** Nombre de banco, beneficiario (`accountHolder`), CLABE y número de cuenta.

#### Sintaxis de uso:

##### A. Ejecución Directa (Local):

```bash
# Modo 1: Simulación previa (--dry-run: te dice exactamente cuántos registros tienen espacios sin modificar la BD)
yarn trim:records --dry-run

# Modo 2: Interactivo (te muestra el reporte y te pide confirmación 'SI')
yarn trim:records

# Modo 3: Desatendido / Automático
yarn trim:records --yes
```

##### B. Ejecución con Docker (Producción / VPS):

```bash
# Simulación previa en el contenedor activo:
docker compose -f docker-compose.prod.yml exec api yarn trim:records --dry-run

# Aplicación interactiva:
docker compose -f docker-compose.prod.yml exec -it api yarn trim:records

# Aplicación desatendida automática:
docker compose -f docker-compose.prod.yml exec api yarn trim:records --yes

# O mediante SQL directo con el contenedor de Postgres:
docker compose -f docker-compose.prod.yml exec -i postgres psql -U condofy -d condofy < scripts/trim_database_records.sql
```

---

## 2. Comandos Frecuentes de Desarrollo y Base de Datos (Local vs Docker)

| Acción / Tarea                  | Ejecución Local (Host)        | Ejecución con Docker (Producción / VPS)                                          |
| :------------------------------ | :---------------------------- | :------------------------------------------------------------------------------- |
| **Iniciar servidor**            | `yarn start:dev`              | `docker compose -f docker-compose.prod.yml up -d`                                |
| **Compilar build**              | `yarn build`                  | `docker compose -f docker-compose.prod.yml build api`                            |
| **Ver logs en vivo**            | Consola directa               | `docker compose -f docker-compose.prod.yml logs -f api`                          |
| **Aplicar migraciones BD**      | `npx prisma migrate dev`      | `docker compose -f docker-compose.prod.yml exec api npx prisma migrate deploy`   |
| **Regenerar Prisma Client**     | `npx prisma generate`         | `docker compose -f docker-compose.prod.yml exec api npx prisma generate`         |
| **Cargar datos semilla (Seed)** | `npx tsx prisma/seed/seed.ts` | `docker compose -f docker-compose.prod.yml exec api npx tsx prisma/seed/seed.ts` |
| **Reiniciar servicio API**      | Reiniciar terminal            | `docker compose -f docker-compose.prod.yml restart api`                          |
| **Shell dentro del contenedor** | N/A                           | `docker compose -f docker-compose.prod.yml exec -it api sh`                      |

---

## 3. 🐳 Guía Rápida de Ejecución con Docker (Producción / VPS)

En entornos de producción donde el backend se despliega mediante `docker-compose.prod.yml`, la base de datos PostgreSQL vive en una red interna aislada (`postgres_db`). Por esta razón, cualquier script administrativo debe ejecutarse a través del contenedor `api`.

### Reglas clave para comandos Docker:

1. **Usa `-it` cuando el script requiera interacción:**
   Si el script hace preguntas interactivas por teclado (`readline`), añade las banderas `-it` para asignar una pseudo-TTY interactiva:

   ```bash
   docker compose -f docker-compose.prod.yml exec -it api yarn reset:billing
   ```

2. **Omite `-it` para ejecuciones desatendidas o cron jobs:**
   Si pasas todos los argumentos o usas `--yes`, no necesitas `-it`:

   ```bash
   docker compose -f docker-compose.prod.yml exec api yarn reset:billing 9 2026 --yes
   ```

3. **Abrir sesión interactiva completa en el contenedor:**
   Si prefieres trabajar como si estuvieras en la máquina local:

   ```bash
   # Entrar al contenedor
   docker compose -f docker-compose.prod.yml exec -it api sh

   # Ya dentro puedes ejecutar cualquier comando yarn o npx:
   yarn reset:billing 9 2026
   exit
   ```

4. **Reconstrucción tras crear o editar scripts:**
   El `Dockerfile` incluye la instrucción `COPY --chown=node:node scripts ./scripts/` en su etapa de ejecución (`runner`). Si agregas un nuevo script en tu repositorio y haces `git pull` en el servidor, reconstruye el contenedor para actualizarlo:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build api
   ```

---

## 4. Guía y Estándar para Crear Futuros Scripts

Cuando necesites crear una nueva tarea administrativa por consola (ej. exportación masiva, regeneración de cuotas, sincronización de saldos, importación de catálogo de viviendas, etc.), sigue estos lineamientos:

### Ubicación y Registro en `package.json`

1. **Ubicación:** Crea tu archivo `.ts` dentro de la carpeta `scripts/` (ej. `scripts/mi-nueva-tarea.ts`).
2. **Alias en `package.json`:** Agrega el acceso directo en la sección `"scripts"`:
   ```json
   "scripts": {
     "tarea:mi-comando": "tsx scripts/mi-nueva-tarea.ts"
   }
   ```
   _Nota:_ Se utiliza `tsx` (TypeScript Execute) ya instalado en el proyecto, el cual compila en memoria instantáneamente sin necesidad de un paso de build previo.
3. **Compatibilidad con Docker:** Gracias a la directiva `COPY scripts ./scripts` en el `Dockerfile`, cualquier script nuevo dentro de `scripts/` estará disponible automáticamente en Docker sin configuraciones adicionales.

---

### Plantilla Base Recomendada

Utiliza la siguiente estructura para garantizar compatibilidad con las variables de entorno, Prisma y Cloudflare R2:

```typescript
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { PrismaClient } from '../src/core/infrastructure/persistence/prisma/generated/client';

// 1. Cliente Prisma con Adapter PG
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// 2. Cliente S3/R2 (opcional, solo si el script gestiona archivos)
const s3Client = process.env.STORAGE_ENDPOINT
  ? new S3Client({
      region: process.env.STORAGE_REGION || 'auto',
      endpoint: process.env.STORAGE_ENDPOINT,
      credentials: {
        accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
      },
    })
  : null;

async function main() {
  const args = process.argv.slice(2);
  const isYes = args.includes('--yes') || args.includes('-y');
  const isDryRun = args.includes('--dry-run');

  console.log(
    '\n=============================================================',
  );
  console.log('🚀 TITULO DE LA TAREA ADMINISTRATIVA');
  console.log(
    '=============================================================\n',
  );

  const rl = readline.createInterface({ input, output });

  try {
    // 3. Lógica de consulta previa y validaciones
    const registros = await prisma.user.findMany({ take: 5 });
    console.log(`Elementos encontrados: ${registros.length}`);

    // 4. Confirmación interactiva si no se especificó --yes ni --dry-run
    if (!isYes && !isDryRun) {
      const confirm = await rl.question('¿Deseas continuar? (escribe SI): ');
      if (confirm.trim().toUpperCase() !== 'SI') {
        console.log('🛑 Operación cancelada.');
        return;
      }
    }

    if (isDryRun) {
      console.log('🔎 Modo simulación activo. No se aplicaron cambios.');
      return;
    }

    // 5. Ejecución atómica en transacción
    await prisma.$transaction(async (tx) => {
      // Modificaciones seguras aquí...
    });

    console.log('\n✅ Proceso completado exitosamente.');
  } finally {
    rl.close();
  }
}

main()
  .catch((err) => {
    console.error('❌ Error en ejecución:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

### Buenas Prácticas Contables y de Seguridad

1. **Usa siempre `prisma.$transaction`:** Las operaciones de actualización masiva o borrado deben ser transaccionales para que, ante cualquier fallo, la base de datos haga rollback y no quede en un estado inconsistente.
2. **Soporta banderas estándar:**
   - `--dry-run`: Muestra qué se vería afectado sin tocar la base de datos ni R2.
   - `--yes` o `-y`: Permite automatizar la ejecución sin pausar en prompts de consola.
3. **Trazabilidad en R2:** Al manipular archivos en Cloudflare R2, extrae la ruta relativa de la clave limpiando cualquier prefijo de protocolo `https://` o nombre de bucket.
4. **Respeto a Saldos a Favor:** Si una operación altera cargos o pagos liquidados, verifica si generaron movimientos en `AccountMovement` / `HouseAccount` para evitar que las viviendas queden con saldos huérfanos.
5. **Cierre de Conexiones:** Finaliza siempre con `await prisma.$disconnect()` y cerrando interfaces de `readline` en un bloque `finally`.
