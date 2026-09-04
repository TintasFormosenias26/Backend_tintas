import { NextFunction, Request, Response } from "express";
import { DeleteAuthors } from "../../app/service/DeleteAuthor.service";
import { DeleteAuthorPostgresRepo, FindAuthorPostgresRepo } from "../../infrastructure/authores.MongoRepo";
import { sendError } from "../../../shared/middlewares/errorHandler";


// new instances of classes 
const deleteAuthorRepo = new DeleteAuthorPostgresRepo();
const findAuthorRepo = new FindAuthorPostgresRepo()
const deleteAuthorService = new DeleteAuthors(deleteAuthorRepo, findAuthorRepo);

//delte author
export const deleteAuthorById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await deleteAuthorService.deleteAuthor(id);
        if (result === null) {
            return sendError(res, 404, "AUTHOR_NOT_FOUND", "No se encontró el autor.");
        }
        return res.status(200).json({ success: true, message: "Autor eliminado correctamente." });

    } catch (error) {
        return next(error);
    }
};
