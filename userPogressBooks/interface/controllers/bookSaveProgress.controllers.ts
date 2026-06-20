import { Request, Response } from "express";
import { BookSaveProgres } from "../../aplication/service/SaveProgress.Service";
import { BookProgresPort } from "../../domain/ports/saveProgres.Ports";
import { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import { GetBooksById, GetBooksByIds } from "../../../books/application";
import { PrismaCrudRepository } from "../../../books/infrastructure/mongo";
import { BookProgresPostgres } from "../../infrastructure/bookProgressRepoMongo";


// Repositorios
const saveRepoMongo: BookProgresPort = new BookProgresPostgres();
// PrismaCrudRepository doesn't fully implement the BooksQueryRepository interface
// in this context; cast to any to satisfy the constructor typing here.
const getBooksByIds = new GetBooksByIds(new PrismaCrudRepository() as any);

// Servicio
const bookService = new BookSaveProgres(saveRepoMongo, getBooksByIds);

export const saveBookProgress = async (req: Request, res: Response) => {
    try {
        const idUser = req.user?.id;
        if (!idUser) {
            res.status(401).json({ msg: "Unauthorized" });
        }

        // Crear el DTO (BookUserProgresRepo) con los datos del request
        const bookData: BookUserProgresRepo = {
            ...req.body,
            idUser,
        };

        const result = await bookService.saveBookProgres(bookData);

        if (!result) {
            res
                .status(304)
                .json({ msg: "The book-progress was not saved" });
        }

        res.status(201).json({
            msg: "The book-progress was saved successfully",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal server error", error });
    }
};