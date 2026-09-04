import { NextFunction, Request, Response } from "express";
import { FindAuthors } from "../../app/service/FindAuthor.service";
import { FindAuthor as findAuthorRepo } from "../../domain/ports/findAuthorRepository";
import { FindAuthorPostgresRepo } from "../../infrastructure/authores.MongoRepo";
import { sendError } from "../../../shared/middlewares/errorHandler";

const findAuthorRepo = new FindAuthorPostgresRepo();
const findAuthorService = new FindAuthors(findAuthorRepo);


export const getAuthorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // ensure id is a string (req.params can be string or string[])
    const rawId = req.params.id;
    const id: string | undefined = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      return sendError(res, 400, "INVALID_AUTHOR_ID", "El identificador del autor no es válido.");
    }

    const author = await findAuthorService.findAuthor(id);

    if (!author) {
      return sendError(res, 404, "AUTHOR_NOT_FOUND", "No se encontró el autor.");
    }


    res.status(200).json(author);
    return;
  } catch (error) {
    next(error);
  }
};
export const getAuthorByName = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    const author = await findAuthorService.findAuthorbyName(name);

    if (!author) {
      return sendError(res, 404, "AUTHOR_NOT_FOUND", "No se encontró el autor.");
    }

    res.status(200).json(author);
  } catch (error) {
    next(error);
  }
};

export const getAllAuthores = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await findAuthorService.findAuthores();

    res.status(200).json({ success: true, result });
  } catch (error) {
    next(error);
  }
};
