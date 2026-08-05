# =========================
# Stage 1: Build
# =========================
FROM node:22-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@11.0.9

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build


# =========================
# Stage 2: Production
# =========================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN npm install -g pnpm@11.0.9

COPY package.json pnpm-lock.yaml ./

# Instala solamente dependencias necesarias para producción
RUN pnpm install --frozen-lockfile --prod


# Copiar solamente el resultado compilado
COPY --from=builder /app/dist ./dist


# Crear usuario sin privilegios
RUN addgroup -S nodeapp && adduser -S nodeapp -G nodeapp

USER nodeapp


EXPOSE 3400

CMD ["node", "dist/src/app.js"]