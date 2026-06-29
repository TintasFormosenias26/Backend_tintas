import { Router } from "express";
import { getBookByAuthor, searchBooksController } from "../controller/booksQueryController";

export const searchRouter = Router()

searchRouter.get("/search", searchBooksController);
searchRouter.get("/:author", getBookByAuthor)