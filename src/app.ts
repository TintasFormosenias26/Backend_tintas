import express from "express";
import type { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import cookies from "cookie-parser";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import type { JsonObject } from "swagger-ui-express";
import YAML from "yamljs";

import ENV from "./shared/config/configEnv";

// Rutas
import { userRoutes } from "./userService/interfaces/routes/userService.routes";
import { autorRoutes } from "./authorService/interfaces/routes/authors.routes";
import bookRouter from "./books/interfaces/router/index";
import { authRoutes } from "./authService/interfaces/routes/auth.routes";
import { progressRouter } from "./userPogressBooks/interface/routes/bookProgress.routes";
import { avaRoutes } from "./avatars/interface/routes/avatar.routes";
import { searchRouter } from "./books/interfaces/router/search.routes";

// Crear aplicación
export const app = express();

// Directorio de uploads
const fileUpload = path.join(process.cwd(), "uploads");
const openapiPath = path.join(process.cwd(), "openapi.yaml");
const swaggerDocument = YAML.load(openapiPath) as JsonObject;
const isProduction = ENV.NODE_ENV === "production";
const shouldExposeSwagger =
    !isProduction || Boolean(ENV.SWAGGER_USER && ENV.SWAGGER_PASSWORD);

const swaggerAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!isProduction) {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("Authentication required");
    }

    const [scheme, encodedCredentials] = authHeader.split(" ");

    if (scheme !== "Basic" || !encodedCredentials) {
        res.setHeader("WWW-Authenticate", "Basic");
        return res.status(401).send("Authentication required");
    }

    try {
        const credentials = Buffer.from(encodedCredentials, "base64").toString("utf8");
        const separatorIndex = credentials.indexOf(":");
        const user = credentials.slice(0, separatorIndex);
        const password = credentials.slice(separatorIndex + 1);
        const validCredentials =
            separatorIndex > -1 &&
            user === ENV.SWAGGER_USER &&
            password === ENV.SWAGGER_PASSWORD;

        if (validCredentials) {
            return next();
        }
    } catch {
        // Invalid Basic Auth header.
    }

    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Authentication required");
};

// Crear carpeta uploads si no existe
if (!fs.existsSync(fileUpload)) {
    fs.mkdirSync(fileUpload, { recursive: true });
}

// Archivos estáticos
app.use("/uploads", express.static(fileUpload));
app.use(express.static(path.join(process.cwd(), "public")));

// Middlewares
app.use(
    cors({
        origin: [
            "http://localhost:5500",
            "http://localhost:3402",
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    })
);

app.use(cookies());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/test", (req, res) => {
    res.json({ ok: true });
});
// Sesiones
app.use(
    session({
        secret: "tu_clave_secreta",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 3600000,
        },
    })
);

if (shouldExposeSwagger) {
    app.use(
        "/api/docs",
        swaggerAuth,
        swaggerUi.serve,
        swaggerUi.setup(swaggerDocument, {
            customSiteTitle: "TINTAS API Docs",
        })
    );

    app.get("/openapi.yaml", swaggerAuth, (req, res) => {
        res.sendFile(openapiPath);
    });

    app.get("/openapi.json", swaggerAuth, (req, res) => {
        res.json(swaggerDocument);
    });
}

// Rutas
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/authors", autorRoutes);
app.use("/api/progress", progressRouter);
app.use("/api/avatar", avaRoutes);
app.use("/api/book", bookRouter);
app.use("/api", searchRouter);

// Servidor
app.listen(Number(ENV.PORT), () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${ENV.PORT}`);
});
