# Tintas — Backend API

Backend de la biblioteca digital Tintas Formoseñas. Expone una API HTTP para
autenticación, usuarios, autores, libros, avatares, progreso de lectura y
recuperación de contraseña.

## Tecnologías

- Node.js 22, Express 5 y TypeScript
- PostgreSQL con Prisma 7
- JWT almacenado en una cookie HttpOnly
- Cloudinary para archivos multimedia
- Resend para correos de recuperación
- Docker y Docker Compose

## Organización del proyecto

`src/server.ts` inicia el servidor y gestiona el cierre ordenado. `src/app.ts`
configura Express, seguridad, CORS, Swagger y las rutas.

```text
src/
├── authService/          # Login, sesión y recuperación de contraseña
├── userService/          # Registro, perfil y administración de usuarios
├── authorService/        # CRUD de autores
├── books/                # Catálogo, búsqueda y CRUD de libros
├── avatars/              # Avatares disponibles
├── userPogressBooks/     # Progreso de lectura por usuario
├── Token/                # Tokens de recuperación hasheados
├── prisma/               # Esquema, cliente y migraciones
└── shared/               # Configuración, seguridad, uploads y utilidades
```

Los módulos separan el dominio y sus contratos, los casos de uso, la
infraestructura y las interfaces HTTP.

## Requisitos

Para Docker se necesita Docker Desktop y una base PostgreSQL accesible desde el
contenedor. Para ejecución directa se necesita Node.js 22 y pnpm 11.9.

## Variables de entorno

Copiar `.env.example` como `.env` y completar:

```dotenv
DATABASE_URL=postgresql://usuario:clave@host:5432/base
JWT_SECRET=una_clave_aleatoria_de_al_menos_32_caracteres
CLOUD_NAME=cloudinary_cloud_name
API_KEY=cloudinary_api_key
API_SECRET=cloudinary_api_secret
API_RENDER=resend_api_key
```

No deben existir espacios alrededor de `=`. Nunca se debe publicar el `.env` ni
incorporarlo a una imagen. `API_RENDER` conserva un nombre histórico, pero su
valor es la API key de Resend.

El Compose local configura automáticamente el puerto `3400`, permite el
frontend `http://localhost:3000` y utiliza cookies aptas para HTTP local. Las
opciones avanzadas de JWT, cookies, rate limit y uploads tienen valores
predeterminados en `src/shared/config/configEnv.ts`.

## Ejecución con Docker — recomendada

Desde `Backend_tintas`:

```powershell
docker compose up --build -d
```

Direcciones útiles:

- API: http://localhost:3400
- proceso: http://localhost:3400/health/live
- API y base de datos: http://localhost:3400/health/ready
- Swagger local: http://localhost:3400/api/docs

Para una base nueva o después de recibir migraciones:

```powershell
docker compose run --rm migrate
```

El Compose predeterminado usa el target `development`, monta el código y reinicia
la API automáticamente al editar archivos.

### Comandos de Docker

| Comando | Para qué sirve |
| --- | --- |
| `docker compose up --build -d` | Construye e inicia la API en segundo plano. |
| `docker compose up -d` | Inicia la API con la imagen existente. |
| `docker compose ps` | Muestra el estado y health check del contenedor. |
| `docker compose logs -f api` | Sigue los logs en tiempo real. |
| `docker compose logs --tail 100 api` | Muestra los últimos 100 mensajes. |
| `docker compose restart api` | Reinicia solamente la API. |
| `docker compose stop` | Detiene los contenedores sin eliminarlos. |
| `docker compose down` | Detiene y elimina contenedores y red local. |
| `docker compose build --no-cache api` | Reconstruye ignorando la caché. |
| `docker compose run --rm migrate` | Aplica migraciones pendientes. |
| `docker compose run --rm migrate pnpm exec prisma migrate status` | Consulta el estado de las migraciones. |

`docker compose down` no elimina la base remota configurada en `DATABASE_URL`.

### Imagen para VM o producción

El archivo de producción no monta el código y utiliza la imagen mínima:

```powershell
docker compose -f docker-compose.production.yml up --build -d
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f api
```

Requiere `IMAGE_TAG`, un origen HTTPS en `CORS_ALLOWED_ORIGINS` y las variables
reales del ambiente. Debe publicarse detrás de Nginx u otro proxy con HTTPS.

## Ejecución directa con Node.js

```powershell
Copy-Item .env.example .env
pnpm install --frozen-lockfile
pnpm exec prisma generate
pnpm exec prisma migrate deploy
pnpm dev
```

Para ejecutar el código compilado:

```powershell
pnpm build
pnpm start
```

### Comandos del proyecto

| Comando | Para qué sirve |
| --- | --- |
| `pnpm install --frozen-lockfile` | Instala exactamente las dependencias bloqueadas. |
| `pnpm dev` | Inicia desarrollo con recarga automática. |
| `pnpm build` | Genera Prisma y compila TypeScript en `dist`. |
| `pnpm start` | Ejecuta `dist/server.js` después del build. |
| `pnpm test` | Ejecuta todas las pruebas automatizadas. |
| `pnpm test:ci` | Ejecuta pruebas con salida para integración continua. |
| `pnpm lint` | Analiza estilo y patrones problemáticos. |
| `pnpm typecheck` | Comprueba tipos sin generar archivos. |
| `pnpm prisma:migrate:deploy` | Aplica migraciones pendientes. |
| `pnpm exec prisma generate` | Regenera el cliente de Prisma. |
| `pnpm exec prisma migrate status` | Consulta migraciones aplicadas y pendientes. |

Validación recomendada antes de entregar cambios:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

## API y rutas principales

| Módulo | Ruta base | Función |
| --- | --- | --- |
| Autenticación | `/api/auth` | Login, logout, sesión y recuperación. |
| Usuarios | `/api/user` | Registro, perfil y administración. |
| Autores | `/api/authors` | Consulta y CRUD de autores. |
| Libros | `/api/book` | Catálogo y CRUD de libros. |
| Búsqueda | `/api/search` | Búsqueda de libros. |
| Avatares | `/api/avatar` | Consulta y administración de avatares. |
| Progreso | `/api/progress` | Progreso privado de lectura. |

La especificación detallada está en `openapi.yaml` y se muestra en Swagger. El
catálogo completo, perfil y progreso requieren autenticación. `ADMIN` gestiona
libros, autores y avatares; `SUPERADMIN` también administra usuarios y roles.

La sesión viaja mediante una cookie HttpOnly. El frontend debe enviar las
peticiones con credenciales y no debe guardar el JWT en `localStorage`.

## Base de datos y migraciones

El esquema está en `src/prisma/schema.prisma` y las migraciones en
`src/prisma/migrations`. Para revisar y aplicar:

```powershell
docker compose run --rm migrate pnpm exec prisma migrate status
docker compose run --rm migrate
```

No usar `prisma migrate reset` en una base con datos: elimina y recrea el
esquema. En TEST o PRODUCCIÓN se requiere un backup verificado.

## Servicios externos

- **PostgreSQL:** usuarios, catálogo, progreso y tokens. Si no responde,
  `/health/ready` devuelve `503`.
- **Cloudinary:** imágenes, libros y audiolibros mediante `CLOUD_NAME`,
  `API_KEY` y `API_SECRET`.
- **Resend:** códigos de recuperación mediante `API_RENDER`. Los tokens se
  guardan hasheados, vencen y son de un solo uso.

## Seguridad

- JWT con emisor, audiencia y expiración.
- Cookies HttpOnly y opciones Secure/SameSite por ambiente.
- CORS mediante una lista exacta de orígenes.
- Validación Origin/Referer para mutaciones autenticadas.
- Rate limiting en login y recuperación.
- Autorización por roles aplicada en el backend.
- Validación de extensión, MIME, firma y tamaño de uploads.
- Respuestas inesperadas sin stack ni detalles de Prisma.
- Contenedor sin privilegios y filesystem de sólo lectura.

## Solución de problemas

### `pnpm` no existe dentro del contenedor `api`

Es intencional. Para Prisma se usa:

```powershell
docker compose run --rm migrate
```

### El correo responde “Error interno del servidor”

```powershell
docker compose logs --tail 100 api
docker compose run --rm migrate pnpm exec prisma migrate status
```

Además de una API key válida de Resend, `Token` debe tener las columnas
`tokenHash`, `expiresAt` y `usedAt`.

### `/health/live` funciona pero `/health/ready` devuelve 503

El proceso está activo, pero no puede consultar PostgreSQL. Revisar
`DATABASE_URL`, red, SSL y disponibilidad de la base.

### Docker ejecuta una versión anterior

```powershell
docker compose up --build -d
```

Para TEST y PRODUCCIÓN consultar [DEPLOYMENT.md](DEPLOYMENT.md).
