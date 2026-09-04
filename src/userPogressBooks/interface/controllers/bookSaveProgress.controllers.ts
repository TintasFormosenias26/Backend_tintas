import { NextFunction, Request, Response } from "express";
import { BookSaveProgres } from "../../aplication/service/SaveProgress.Service";
import { BookProgresPort } from "../../domain/ports/saveProgres.Ports";
import { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import { PrismaCrudRepository } from "../../../books/infrastructure/mongo";
import { BookProgresPostgres } from "../../infrastructure/ProgressBookRepoMongo";
import { sendError } from "../../../shared/middlewares/errorHandler";


// Repositorios
const saveRepoMongo: BookProgresPort = new BookProgresPostgres();
const getBooks = new PrismaCrudRepository();

// Servicio
const bookService = new BookSaveProgres(saveRepoMongo, getBooks);

export const saveBookProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const idUser = req.user?.id;
        if (!idUser) {
            return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
        }

        // Crear el DTO (BookUserProgresRepo) con los datos del request
        const bookData: BookUserProgresRepo = {
            ...req.body,
            idUser,
        };

        const result = await bookService.saveBookProgres(bookData);

        if (!result) {
            return sendError(res, 409, "PROGRESS_NOT_SAVED", "No se pudo guardar el progreso.");
        }

        res.status(201).json({
            success: true,
            message: "Progreso guardado correctamente.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};
