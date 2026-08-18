FROM node:22-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@11.0.9

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código
COPY . .

# Compilar
RUN pnpm run build

EXPOSE 3400

CMD ["node", "dist/src/app.js"]