FROM node:20-alpine

WORKDIR /app

# Instalar pnpm globalmente
RUN corepack enable && corepack prepare pnpm@10.34.3 --activate

# Copiar dependencias primero (cache optimizado)
COPY package.json pnpm-lock.yaml ./

RUN pnpm install

# Copiar todo el proyecto
COPY . .


# Compilar TypeScript
RUN pnpm run build

EXPOSE 3000

CMD ["node", "dist/src/index.js"]