# Runbook de despliegue — TEST y PRODUCCIÓN

Este documento es una referencia; no autoriza ejecutar comandos sobre la VM ni una base remota.

## Variables y separación

Crear secretos independientes por ambiente: `DATABASE_URL`, `JWT_SECRET`, credenciales Cloudinary/Resend, credenciales Swagger y TLS. TEST y PROD no deben compartir base, bucket, volumen ni secreto. CORS debe contener orígenes HTTPS exactos. `COOKIE_SECURE=true`, `COOKIE_SAME_SITE=lax` y `TRUST_PROXY_HOPS=1` son el punto de partida detrás de un único proxy confiable.

No construir ni editar código en la VM. CI debe producir imágenes inmutables etiquetadas con commit SHA; promover exactamente la imagen validada.

## Preflight local/CI

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm lint
pnpm typecheck
pnpm build
pnpm audit --prod
docker compose --env-file .env.test config --quiet
docker build --pull -t registry.example.invalid/tintas-backend:<commit> .
```

Reemplazar los nombres de ejemplo sólo cuando infraestructura confirme registry, dominios y red.

## Migraciones

Antes de toda migración:

1. respaldar PostgreSQL y verificar restauración en una base aislada;
2. ejecutar `docker compose run --rm migrate pnpm exec prisma migrate status`;
3. revisar el SQL pendiente y estimar locks/tamaño;
4. ensayar el backup y `docker compose run --rm migrate` en una copia de TEST;
5. registrar conteos y checksums funcionales antes/después.

La migración histórica `20260626020126_init` elimina columnas de `Author` y la tabla `BookContent`: es potencialmente destructiva si aún no fue aplicada. No debe ejecutarse a ciegas en una base con datos. Confirmar primero el estado real y exportar los datos afectados. La migración `20260818000000_secure_password_reset_tokens` renombra el token a hash y expira los tokens existentes deliberadamente; no elimina usuarios ni libros.

## TEST

1. Aprovisionar red/DB/secretos exclusivos y TLS.
2. Restaurar una copia anonimizada y probar restauración.
3. Aplicar migraciones con ventana acordada.
4. Desplegar imágenes por SHA, detrás del proxy; publicar sólo 443.
5. Verificar `/health/live`, `/health/ready`, login/logout, recuperación, roles, CRUD, uploads, lectura PDF y aislamiento de progreso.
6. Confirmar CORS/CSRF, cookies Secure/HttpOnly/SameSite, 429, errores sin stack y Swagger restringido.
7. Verificar que 401, 403, 404, 409, 413, 422, 429 y 500 respeten el contrato de errores y contengan `requestId`.
8. Ejecutar smoke, concurrencia esperada y observación de métricas/logs.
9. Congelar el SHA aprobado y emitir acta de aprobación.

## Criterios de pase a PROD

Todos los tests/builds deben pasar; no puede haber vulnerabilidades críticas/altas abiertas; backup y restauración deben estar ensayados; health checks, alertas, TLS, rollback y responsables deben estar confirmados. Cualquier fallo de autorización, migración, pérdida de datos, cookie insegura o readiness rechaza el pase.

## PRODUCCIÓN

Repetir el proceso con secretos/DB/almacenamiento exclusivos. Hacer backup verificado, aplicar migraciones antes de promover aplicaciones incompatibles, desplegar por rolling/blue-green según infraestructura confirmada, ejecutar smoke y observar errores/latencia. No reutilizar tags mutables como `latest`.

## Rollback

- Frontend/backend: volver al SHA de imagen anterior; no reconstruir.
- Base: preferir migraciones compatibles hacia adelante. Si la migración causó daño, detener escrituras y restaurar el backup verificado. No ejecutar `migrate reset`.
- Si el esquema nuevo no es retrocompatible con el binario anterior, mantener una versión puente o completar el rollback de esquema documentado y ensayado.

## Post-despliegue

Verificar health, autenticación, autorización, subida/lectura, errores 4xx/5xx, colas de email, almacenamiento, espacio, conexiones DB, latencia, alertas, certificados y ausencia de secretos/datos personales en logs.
