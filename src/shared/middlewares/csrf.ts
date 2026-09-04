import type {
  NextFunction,
  Request,
  Response,
} from "express";

import ENV from "../config/configEnv";
import { sendError } from "./errorHandler";


const SAFE_METHODS = new Set([
  "GET",
  "HEAD",
  "OPTIONS",
]);

export function createRequestOriginValidator(
  allowedOrigins: readonly string[],
) {
  return function validateRequestOrigin(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    let requestOrigin =
      req.get("origin");

    if (!requestOrigin) {
      const referer =
        req.get("referer");

      if (referer) {
        try {
          requestOrigin =
            new URL(referer).origin;
        } catch {
          requestOrigin = undefined;
        }
      }
    }

   
    if (
      !requestOrigin ||
      !allowedOrigins.includes(
        requestOrigin,
      )
    ) {
      return sendError(
        res,
        403,
        "INVALID_REQUEST_ORIGIN",
        "Origen de solicitud no permitido.",
      );
    }

    return next();
  };
}

export const validateRequestOrigin =
  createRequestOriginValidator(
    ENV.CORS_ORIGINS,
  );