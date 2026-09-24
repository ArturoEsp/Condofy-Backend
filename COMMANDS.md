# 🛠️ Condofy - Guía de Comandos y Scripts Administrativos

Este documento contiene la referencia completa de los comandos de consola actuales, utilidades de mantenimiento para la base de datos y Cloudflare R2, su **ejecución tanto en entorno local como en Docker (producción)**, y la guía para la creación de **futuros scripts**.

---

## 📑 Índice

1. [Scripts Administrativos Actuales](#1-scripts-administrativos-actuales)
   - [`reset:billing` (Reinicio de Cobranza y Limpieza R2)](#resetbilling-reinicio-de-cobranza-y-limpieza-r2)
   - [`delete:resident` (Eliminación de Residente en Cascada)](#deleteresident-eliminación-de-residente-en-cascada)
   - [`delete:condominium` (Eliminación de Condominio en Cascada)](#deletecondominium-eliminación-de-condominio-en-cascada)
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
# Modo interactivo (pregunta condominio, mes y año)
yarn reset:billing

# Con parámetros directos (Mes y Año)
yarn reset:billing 9 2026
yarn reset:billing septiembre 2026

# Simulación previa (NO borra nada, lista archivos y pagos encontrados)
yarn reset:billing 9 2026 --dry-run

# Desatendido / Automático (Sin confirmación 'SI')
yarn reset:billing 9 2026 --yes

# Eliminación total (elimina cargos y periodo por completo)
yarn reset:billing 9 2026 --hard-delete
```

##### B. Ejecución con Docker (En Servidor de Producción / VPS):

```bash
# Modo interactivo a través del contenedor activo:
docker compose -f docker-compose.prod.yml exec -it api yarn reset:billing 9 2026

# Modo desatendido / directo:
docker compose -f docker-compose.prod.yml exec api yarn reset:billing 9 2026 --yes

# Simulación previa en producción:
docker compose -f docker-compose.prod.yml exec api yarn reset:billing 9 2026 --dry-run

# O ingresando a la shell interactiva del contenedor:
docker compose -f docker-compose.prod.yml exec -it api sh
# (y dentro del contenedor ejecutas directamente):
yarn reset:billing 9 2026
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
