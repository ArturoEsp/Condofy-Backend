# 1. ETAPA DE CONSTRUCCIÓN (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos e instalar dependencias de desarrollo y producción
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copiar el código fuente y compilar NestJS
# Con Prisma 7, la generación ocurre de forma integrada o mediante la build
COPY . .
RUN npx prisma generate
RUN npm run build

# 2. ETAPA DE EJECUCIÓN (Runner)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar solo lo estrictamente necesario para producción
COPY package*.json ./
COPY prisma ./prisma/

# Instalar únicamente dependencias de producción
RUN npm ci --only=production

# Copiar la compilación de NestJS desde la etapa anterior
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Aplicar migraciones al iniciar el contenedor y arrancar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]