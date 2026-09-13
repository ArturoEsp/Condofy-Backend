# 1. ETAPA DE CONSTRUCCIÓN (Builder)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de paquetes e instalar dependencias con yarn
COPY package.json yarn.lock ./
COPY prisma ./prisma/

RUN yarn install --frozen-lockfile

# Copiar código fuente, generar Prisma Client y compilar NestJS
COPY . .
RUN npx prisma generate
RUN yarn build

# 2. ETAPA DE EJECUCIÓN (Runner)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copiar manifiestos y prisma schema
COPY --chown=node:node package.json yarn.lock ./
COPY --chown=node:node prisma ./prisma/

# Instalar dependencias de producción
RUN yarn install --production --frozen-lockfile && yarn cache clean

# Copiar la compilación desde el builder
COPY --from=builder --chown=node:node /app/dist ./dist

# Ejecutar como usuario sin privilegios
USER node

EXPOSE 3000

CMD ["node", "dist/main"]