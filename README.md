# 🏢 Condofy - Backend API

Backend RESTful para la plataforma de administración y control de condominios **Condofy**, desarrollado con **NestJS**, **TypeScript**, **PostgreSQL** y **Prisma ORM**.

---

## 🏛️ Arquitectura de Software

El proyecto sigue los principios de **Arquitectura Hexagonal (Ports & Adapters)** combinados con **Domain-Driven Design (DDD)**:

```
src/
├── app/                              # Módulos de dominio y bounded contexts
│   ├── auth/                         # Autenticación, JWT, rotación de sesiones
│   ├── condominiums/                 # Administración de condominios
│   ├── houses/                       # Gestión de casas y asignaciones
│   ├── residents/                    # Perfiles de residentes y usuarios
│   └── users/                        # Gestión de identidad y credenciales
│       └── [módulo]/
│           ├── domain/               # Entidades, Value Objects e interfaces de Repositorio (Puertos)
│           ├── application/          # Casos de uso y Commands (Lógica de aplicación agnóstica)
│           ├── infrastructure/       # Implementaciones de repositorio con Prisma y Mappers (Adaptadores)
│           └── presentation/         # Controladores HTTP, DTOs con validación y Swagger Docs
├── common/                           # Decoradores, Guards, Pipes, Enums transversales
│   ├── decorators/                   # @Public(), @Roles(), @CondominiumId(), @CurrentUser()
│   ├── pipes/                        # CondominiumIdPipe
│   └── enums/                        # Nombres de inyección de dependencias (PROVIDES_NAMES)
└── core/                             # Servicios nucleares (PrismaService, EncryptionService, Filtros globales)
    ├── domain/                       # Contratos centrales de servicios
    └── infrastructure/               # Persistencia Prisma, adaptadores criptográficos (Bcrypt)
```

### Principios Clave

1. **Inversión de Dependencias (DIP):** Los casos de uso orquestan la lógica de negocio consumiendo contratos de repositorio de la capa de dominio, desacoplados del ORM (Prisma).
2. **Aislamiento Multi-Inquilino (Multi-Tenancy):** Control estricto de accesos mediante `CondominiumGuard` y validación de contexto en capa de aplicación para garantizar que los recursos pertenezcan al condominio activo.
3. **Cifrado Seguro:** Las contraseñas se procesan mediante `EncryptionService` con Bcrypt antes de cualquier persistencia.
4. **Resiliencia de Sesiones:** Autenticación por cookies HTTP-only con rotación criptográfica segura de Refresh Tokens.

---

## 🚀 Requisitos Previos

- **Node.js:** v20.x o superior
- **Yarn:** v1.22.x
- **PostgreSQL:** v16.x (o Docker para levantarlo en contenedor)

---

## ⚙️ Configuración del Entorno

1. Clona el repositorio y navega al directorio del proyecto:

   ```bash
   git clone https://github.com/ArturoEsp/Condofy-Backend.git
   cd Condofy-Backend
   ```

2. Crea tu archivo de variables de entorno a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

3. Configura las variables esenciales en `.env`:
   ```dotenv
   APP_PORT=3000
   APP_ENV=development
   APP_SECRET=clave_secreta_jwt_minimo_32_caracteres
   JWT_REFRESH_SECRET=clave_secreta_refresh_minimo_32_caracteres
   DATABASE_URL="postgresql://postgres:root@localhost:5432/condofy?schema=public"
   ```

---

## 📦 Instalación y Base de Datos

```bash
# 1. Instalar dependencias
yarn install

# 2. Generar el cliente de Prisma
npx prisma generate

# 3. Aplicar migraciones a la base de datos
npx prisma migrate dev

# 4. (Opcional) Cargar datos semilla
npx tsx prisma/seed/seed.ts
```

---

## 💻 Ejecución

```bash
# Modo desarrollo con recarga en caliente
yarn start:dev

# Modo producción
yarn build
yarn start:prod
```

---

## 📖 Documentación de la API (Swagger)

Una vez iniciado el servidor, accede a la documentación interactiva Swagger en:

```
http://localhost:3000/api-docs
```

---

## 🐳 Despliegue con Docker

El proyecto incluye un `Dockerfile` optimizado en múltiples etapas (_multi-stage build_) y un manifiesto `docker-compose.prod.yml`:

```bash
# Construir y levantar servicios con Docker Compose
docker compose -f docker-compose.prod.yml up -d --build
```
