import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// `prisma generate` no se conecta a PostgreSQL, pero Prisma exige una URL al
// cargar la configuración. La aplicación valida la URL real al arrancar.
const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://build:build@localhost:5432/build';

export default defineConfig({
  schema: 'src/prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
