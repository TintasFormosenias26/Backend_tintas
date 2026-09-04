import express from "express";
import type { NextFunction, Request, Response } from "express";
import cors from "cors";
import cookies from "cookie-parser";
import helmet from "helmet";
import path from "node:path";
import fs from "node:fs";
import swaggerUi from "swagger-ui-express";
import type { JsonObject } from "swagger-ui-express";
import YAML from "yaml";

import ENV from "./shared/config/configEnv";
import { prisma } from "./shared/lib/prisma";

import { validateRequestOrigin } from "./shared/middlewares/csrf";
import {
  AppError,
  errorHandler,
  notFoundHandler,
} from "./shared/middlewares/errorHandler";
import { requestContext } from "./shared/middlewares/requestContext";

import { userRoutes } from "./userService/interfaces/routes/userService.routes";
import { autorRoutes } from "./authorService/interfaces/routes/authors.routes";
import bookRouter from "./books/interfaces/router";
import { authRoutes } from "./authService/interfaces/routes/auth.routes";
import { progressRouter } from "./userPogressBooks/interface/routes/bookProgress.routes";
import { avaRoutes } from "./avatars/interface/routes/avatar.routes";
import { searchRouter } from "./books/interfaces/router/search.routes";

export function createApp() {
  const app = express();

  if (ENV.TRUST_PROXY_HOPS > 0) {
    app.set("trust proxy", ENV.TRUST_PROXY_HOPS);
  }

  app.disable("x-powered-by");

  app.use(requestContext);

  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  
  app.use(
    cors({
      origin(origin, callback) {
        if (isCorsOriginAllowed(origin)) {
          return callback(null, true);
        }

        return callback(
          new AppError(
            403,
            "CORS_ORIGIN_DENIED",
            "Origen no permitido.",
          ),
        );
      },

      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

      credentials: true,
    }),
  );

  app.use(cookies());

  app.use(
    express.json({
      limit: "1mb",
    }),
  );

  app.use(
    express.urlencoded({
      extended: true,
      limit: "1mb",
    }),
  );

 
  app.use(validateRequestOrigin);

  app.use(
    express.static(path.join(process.cwd(), "public"), {
      dotfiles: "deny",
      fallthrough: true,
    }),
  );

  app.get("/health/live", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");

    return res.json({
      status: "ok",
    });
  });

  app.get(
    "/health/ready",
    readinessHandler(() => prisma.$queryRaw`SELECT 1`),
  );

  if (ENV.NODE_ENV !== "production") {
    app.get("/test", (_req, res) => {
      return res.json({
        ok: true,
      });
    });
  }

  mountSwagger(app);

  app.use("/api/user", userRoutes);

  app.use("/api/auth", authRoutes);

  app.use("/api/authors", autorRoutes);

  app.use("/api/progress", progressRouter);

  app.use("/api/avatar", avaRoutes);

  app.use("/api/book", bookRouter);

  app.use("/api", searchRouter);

  app.use(notFoundHandler);

  app.use(errorHandler);

  return app;
}


export const app = createApp();

export function isCorsOriginAllowed(origin?: string): boolean {
  return !origin || ENV.CORS_ORIGINS.includes(origin);
}

function mountSwagger(app: express.Express) {
  const isProduction = ENV.NODE_ENV === "production";

  if (
    isProduction &&
    !(ENV.SWAGGER_USER && ENV.SWAGGER_PASSWORD)
  ) {
    return;
  }

  const openapiPath = path.join(
    process.cwd(),
    "openapi.yaml",
  );

  const swaggerDocument = YAML.parse(
    fs.readFileSync(openapiPath, "utf8"),
  ) as JsonObject;

  const authenticate = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    /*
     * Local/test automatizado:
     * Swagger puede utilizarse sin autenticación.
     */
    if (!isProduction) {
      return next();
    }

    const authorization =
      req.headers.authorization ?? "";

    const [scheme, encodedCredentials = ""] =
      authorization.split(" ");

    if (scheme !== "Basic" || !encodedCredentials) {
      return requestSwaggerAuthentication(res);
    }

    try {
      const credentials = Buffer.from(
        encodedCredentials,
        "base64",
      ).toString("utf8");

      const separator = credentials.indexOf(":");

      if (separator === -1) {
        return requestSwaggerAuthentication(res);
      }

      const user = credentials.slice(0, separator);

      const password = credentials.slice(
        separator + 1,
      );

      if (
        user === ENV.SWAGGER_USER &&
        password === ENV.SWAGGER_PASSWORD
      ) {
        return next();
      }
    } catch {
      // Header Basic inválido.
    }

    return requestSwaggerAuthentication(res);
  };

  app.use(
    "/api/docs",
    authenticate,
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "TINTAS API Docs",
    }),
  );

  app.get(
    "/openapi.yaml",
    authenticate,
    (_req, res) => {
      return res.sendFile(openapiPath);
    },
  );

  app.get(
    "/openapi.json",
    authenticate,
    (_req, res) => {
      return res.json(swaggerDocument);
    },
  );
}

function requestSwaggerAuthentication(
  res: Response,
) {
  res.setHeader(
    "WWW-Authenticate",
    'Basic realm="TINTAS API Docs"',
  );

  return res
    .status(401)
    .send("Authentication required");
}

export function readinessHandler(
  check: () => Promise<unknown>,
) {
  return async (
    _req: Request,
    res: Response,
  ) => {
    res.setHeader("Cache-Control", "no-store");

    try {
      await check();

      return res.json({
        status: "ready",
      });
    } catch {
      return res.status(503).json({
        status: "unavailable",
      });
    }
  };
}