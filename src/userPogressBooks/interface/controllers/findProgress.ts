import { NextFunction, Request, Response } from "express";
import { FindProgresByID } from "../../aplication/service/FindById.Service";
import { FindProgressPostgres } from "../../infrastructure/ProgressBookRepoMongo";



const findProgresMongo = new FindProgressPostgres
const findProgress = new FindProgresByID(findProgresMongo)
import { sendError } from "../../../shared/middlewares/errorHandler";


export const findByProgressIdControllers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.user?.id;
        if (!id) return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
        const result = await findProgress.findByUser(id)
        if (!result) {
            return sendError(res, 404, "PROGRESS_NOT_FOUND", "No se encontró progreso de lectura.");
        }
        res.status(200).json({ result })
    } catch (error) {
        next(error);
    }
}
export const findProgressByBook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idUser = req.user?.id;
        const rawBookId = req.params.id;
        const idBook = Array.isArray(rawBookId) ? rawBookId[0] : rawBookId;
        if (!idUser || !idBook) return sendError(res, 400, "INVALID_PROGRESS_QUERY", "Los datos enviados no son válidos.");

        const result = await findProgress.findByBook(idBook, idUser)
        if (!result) {
            return sendError(res, 404, "PROGRESS_NOT_FOUND", "No se encontró progreso para este libro.");
        }
        res.status(200).json({ result })
    } catch (error) {
        next(error);

    }
}
