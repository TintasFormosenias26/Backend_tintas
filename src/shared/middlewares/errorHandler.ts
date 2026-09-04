import type {
  NextFunction,
  Request,
  Response,
} from "express";

import multer from "multer";
import { ZodError } from "zod";

import ENV from "../config/configEnv";

type ErrorDetails =
  Record<string, unknown>;

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: ErrorDetails,
  ) {
    super(message);

    this.name = "AppError";
  }
}

export function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: ErrorDetails,
) {
  const requestId =
    typeof res.locals.requestId === "string"
      ? res.locals.requestId
      : undefined;

  const error = {
    code,
    message,

    ...(requestId
      ? { requestId }
      : {}),

    ...(details
      ? { details }
      : {}),
  };

  return res.status(status).json({
    success: false,

    error,

    code,

    message,

    ...(requestId
      ? { requestId }
      : {}),
  });
}

export function notFoundHandler(
  _req: Request,
  res: Response,
) {
  return sendError(
    res,
    404,
    "RESOURCE_NOT_FOUND",
    "No se encontró el recurso solicitado.",
  );
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const requestId =
    res.locals.requestId;

  /*
   * Errores de Multer / uploads.
   */
  if (
    error instanceof
    multer.MulterError
  ) {
    const tooLarge =
      error.code ===
      "LIMIT_FILE_SIZE";

    return sendError(
      res,

      tooLarge
        ? 413
        : 400,

      tooLarge
        ? "FILE_TOO_LARGE"
        : "INVALID_UPLOAD",

      tooLarge
        ? "El archivo supera el tamaño permitido."
        : "El archivo no cumple los requisitos permitidos.",
    );
  }

  /*
   * Validaciones Zod.
   *
   * No devolvemos toda la estructura de Zod
   * para no exponer información innecesaria.
   */
  if (error instanceof ZodError) {
    const fields = Array.from(
      new Set(
        error.issues
          .map((issue) =>
            issue.path.join("."),
          )
          .filter(Boolean),
      ),
    );

    return sendError(
      res,
      422,
      "VALIDATION_ERROR",
      "Revisá los campos indicados.",
      {
        fields,
      },
    );
  }

  
  if (error instanceof AppError) {
    return sendError(
      res,
      error.status,
      error.code,
      error.message,
      error.details,
    );
  }

  
  const legacyStatus =
    getHttpStatus(error);

  if (legacyStatus) {
    const defaults:
      Record<
        number,
        [string, string]
      > = {
        400: [
          "INVALID_REQUEST",
          "La solicitud no es válida.",
        ],

        401: [
          "UNAUTHORIZED",
          "Debés iniciar sesión.",
        ],

        403: [
          "FORBIDDEN",
          "No tenés permisos para realizar esta acción.",
        ],

        404: [
          "RESOURCE_NOT_FOUND",
          "No se encontró el recurso solicitado.",
        ],

        409: [
          "RESOURCE_CONFLICT",
          "El registro ya existe.",
        ],

        413: [
          "PAYLOAD_TOO_LARGE",
          "La solicitud supera el tamaño permitido.",
        ],

        422: [
          "VALIDATION_ERROR",
          "Revisá los campos indicados.",
        ],

        429: [
          "TOO_MANY_REQUESTS",
          "Realizaste demasiadas solicitudes. Intentá nuevamente más tarde.",
        ],
      };

    const [
      code,
      message,
    ] =
      defaults[legacyStatus] ?? [
        "OPERATION_FAILED",
        "No se pudo completar la operación.",
      ];

    return sendError(
      res,
      legacyStatus,
      code,
      message,
    );
  }

 
  const prismaCode =
    getPrismaCode(error);

  if (prismaCode === "P2002") {
    return sendError(
      res,
      409,
      "RESOURCE_CONFLICT",
      "El registro ya existe.",
    );
  }

  if (prismaCode === "P2003") {
    return sendError(
      res,
      409,
      "RESOURCE_IN_USE",
      "El recurso está relacionado con otros registros.",
    );
  }

  if (prismaCode === "P2025") {
    return sendError(
      res,
      404,
      "RESOURCE_NOT_FOUND",
      "No se encontró el recurso solicitado.",
    );
  }

 
  if (prismaCode) {
    process.stderr.write(
      `${JSON.stringify({
        level: "error",
        event: "database_error",
        requestId,
        prismaCode,
      })}\n`,
    );

    return sendError(
      res,
      500,
      "DATABASE_ERROR",
      "No pudimos procesar la solicitud.",
    );
  }

  const logEntry:
    Record<string, unknown> = {
      level: "error",
      event: "unhandled_error",
      requestId,
    };

  if (error instanceof Error) {
    logEntry.errorName =
      error.name;

    if (
      ENV.NODE_ENV !==
      "production"
    ) {
      logEntry.message =
        error.message;

      logEntry.stack =
        error.stack;
    }
  }

  process.stderr.write(
    `${JSON.stringify(logEntry)}\n`,
  );

  return sendError(
    res,
    500,
    "INTERNAL_ERROR",
    "Ocurrió un problema inesperado.",
  );
}

function getPrismaCode(
  error: unknown,
): string | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return null;
  }

  const code = (
    error as {
      code?: unknown;
    }
  ).code;

  return typeof code === "string" &&
    /^P\d{4}$/.test(code)
    ? code
    : null;
}

function getHttpStatus(
  error: unknown,
): number | null {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return null;
  }

  const candidate =
    error as {
      status?: unknown;
      statusCode?: unknown;
    };

  const status =
    typeof candidate.status ===
    "number"
      ? candidate.status
      : candidate.statusCode;

  if (
    typeof status === "number" &&
    status >= 400 &&
    status < 500
  ) {
    return status;
  }

  return null;
}