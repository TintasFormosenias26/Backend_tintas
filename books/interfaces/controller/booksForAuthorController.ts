import { Request, Response } from "express";
import { GetBookByAuthorId } from "../../application";
import { PrismaAuthorRepository } from "../../infrastructure/mongo";

const mongoAuthorRepo = new PrismaAuthorRepository()
const getByAuthorService = new GetBookByAuthorId(mongoAuthorRepo)

export class BookForAuthorController {
     async getBookByAuthorId(req: Request, res: Response): Promise<Response> {
          try {
               const id = req.params.id;


               const books = await getByAuthorService.run(id);

               return res.status(200).json(books);
          } catch (error) {
               console.log(error);
               return res.status(500).json({ msg: "Erro inesperado por favor intente de nuevo mas tarde" });
          }
     }
}