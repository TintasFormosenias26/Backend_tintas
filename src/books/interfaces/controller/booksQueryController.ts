import { NextFunction, Request, Response } from "express";
import { BookSearchType } from "../../domain/entities/bookSearch";
import { PrismaBookRepository } from "../../infrastructure/mongo/SearchBooksPrisma";
import { SearchBookService } from "../../application/crud/SearchBooks";
import { PrismaAuthorRepository } from "../../infrastructure/mongo";
import { GetBookByAuthor } from "../../application/crud/getBookbyAuthor";
import { Level } from "../../../prisma/generated/enums";
import { sendError } from "../../../shared/middlewares/errorHandler";



// Instancias
const searchBookRepo = new PrismaBookRepository();
const searchBookService = new SearchBookService(searchBookRepo);


export const searchBooksController = async (req: Request, res: Response, next: NextFunction) => {

  try {

    const filters = new BookSearchType();

    filters.title = req.query.title as string;
    filters.synopsis = req.query.synopsis as string;
    filters.language = req.query.language as string;
    filters.genre = req.query.genre as string;
    const level = typeof req.query.level === "string" ? req.query.level.toUpperCase() : undefined;
    if (level && !Object.values(Level).includes(level as Level)) {
      return sendError(res, 422, "INVALID_LEVEL", "El nivel indicado no es válido.");
    }
    filters.level = level as Level | undefined;
    filters.format = req.query.format as string;
    filters.yearBook = req.query.yearBook as string;
    filters.authorName = req.query.authorName as string;

    if (req.query.available !== undefined)
      filters.available = req.query.available === "true";

    if (req.query.anthology !== undefined)
      filters.anthology = req.query.anthology === "true";

    if (req.query.theme)
      filters.theme = (req.query.theme as string).split(",");

    if (req.query.subgenre)
      filters.subgenre = (req.query.subgenre as string).split(",");
    const books = await searchBookService.search(filters);


    res.status(200).json(books);

  } catch (error) {
    next(error);

  }

};
const getBookByAuthorPrisma = new PrismaAuthorRepository()
const getBookAuthorServi = new GetBookByAuthor(getBookByAuthorPrisma)

export const getBookByAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = Array.isArray(req.params.author) ? req.params.author[0] : req.params.author;
    const result = await getBookAuthorServi.getByAuthor(author)

    if (!result) {
      return sendError(res, 404, "BOOKS_NOT_FOUND", "No se encontraron libros para este autor.");
    }
    res.status(200).json({ result });
  } catch (error) {
    next(error);

  }
}
