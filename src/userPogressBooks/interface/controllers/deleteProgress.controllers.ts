import { DeleteRepo } from "../../infrastructure/ProgressBookRepoMongo";
import { deleteProgress } from '../../domain/ports/deleteProgress.Ports'
import { DeleteProgresService } from "../../aplication/service/DeleteProgress.Service";
import { NextFunction, Request, Response } from "express";
import { sendError } from "../../../shared/middlewares/errorHandler";

const repo: deleteProgress = new DeleteRepo();
const deleteService: deleteProgress = new DeleteProgresService(repo);


export const deleteProgresBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const userId = req.user?.id;
        if (!userId || typeof id !== "string") {
            return sendError(res, 400, "INVALID_PROGRESS_DELETE", "Los datos enviados no son válidos.");
        }
        const deleted = await deleteService.deleteProgres(id, userId);
        if (!deleted) {
            return sendError(res, 404, "PROGRESS_NOT_FOUND", "No se encontró el progreso.");
        }

        return res.status(200).json({ success: true, message: "Progreso eliminado correctamente." });

    } catch (error) {
        return next(error);
    }
}
