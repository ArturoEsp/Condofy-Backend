# 1. ETAPA DE CONSTRUCCIÓN (Builder)
FROM node:22-slim AS builder

WORKDIR /app

# Instalar dependencias del sistema para Prisma y certificados SSL
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos de paquetes e instalar dependencias con yarn
COPY package.json yarn.lock prisma.config.ts* ./
COPY prisma ./prisma/

# Instalar dependencias con compatibilidad para Prisma 7
RUN yarn install --ignore-engines

# Copiar código fuente, generar Prisma Client y compilar NestJS
COPY . .
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/condofy?schema=public"
RUN npx prisma generate
RUN yarn build

# 2. ETAPA DE EJECUCIÓN (Runner)
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Instalar OpenSSL para el motor de Prisma en tiempo de ejecución
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiar manifiestos, tsconfig y prisma schema
COPY --chown=node:node package.json yarn.lock tsconfig.json prisma.config.ts* ./
COPY --chown=node:node prisma ./prisma/

# Copiar dependencias ya instaladas y compiladas desde el builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copiar cliente generado de Prisma (requerido para seed y utilidades)
COPY --from=builder --chown=node:node /app/src/core/infrastructure/persistence/prisma/generated ./src/core/infrastructure/persistence/prisma/generated

# Copiar la compilación desde el builder
COPY --from=builder --chown=node:node /app/dist ./dist

# Ejecutar como usuario sin privilegios
USER node

EXPOSE 3000

CMD ["yarn", "start:prod:migrate"]