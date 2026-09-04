import { NextFunction, Request, Response } from "express";
import { sendError } from "../../../shared/middlewares/errorHandler";
import { UpdateProgressService } from "../../aplication/service/UpdateProgress.Service";
import { FindProgressPostgres, UpdateProgressPostgres } from "../../infrastructure/ProgressBookRepoMongo";

// Instancias
const updateRepo = new UpdateProgressPostgres();
const getProgress = new FindProgressPostgres()
const bookService = new UpdateProgressService(updateRepo, getProgress);

// Controlador para actualizar progreso
export const updateProgresBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, ...progressData } = req.body; // Tomamos id y el resto como datos del progreso
        const userId = req.user?.id;
        if (!userId || typeof id !== "string") {
            return sendError(res, 400, "INVALID_PROGRESS_UPDATE", "Los datos enviados no son válidos.");
        }

        // Llamamos al servicio con los datos planos
        const result = await bookService.updateProgres(id, userId, progressData);

        if (!result) {
            return sendError(res, 404, "PROGRESS_NOT_FOUND", "No se encontró el progreso.");
        } else {
            return res.status(200).json({ success: true, message: "Progreso actualizado correctamente.", result });
        }
    } catch (error) {
        return next(error);
    }
};
