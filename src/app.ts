import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import cookies from "cookie-parser";
import session from "express-session";

import ENV from "./shared/config/configEnv";

// Rutas
import { userRoutes } from "./userService/interfaces/routes/userService.routes";
import { autorRoutes } from "./authorService/interfaces/routes/authors.routes";
import bookRouter from "./books/interfaces/router/index";
import { authRoutes } from "./authService/interfaces/routes/auth.routes";
import { progressRouter } from "./userPogressBooks/interface/routes/bookProgress.routes";
import { avaRoutes } from "./avatars/interface/routes/avatar.routes";

// Crear aplicación
export const app = express();

// Directorio de uploads
const fileUpload = path.join(process.cwd(), "uploads");

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

// Rutas
app.use(userRoutes);
app.use(authRoutes);
app.use(autorRoutes);
app.use(progressRouter);
app.use(avaRoutes);
app.use(bookRouter);

// Servidor
app.listen(Number(ENV.PORT), () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${ENV.PORT}`);
    console.log(`📡 Health check: http://localhost:${ENV.PORT}`);
});