import {
  CreateBook,
  DeleteBook,
  GetAllBooks,
  GetBooksById,
  UpdateBooksById,
  GetAllBooksByLevel,
} from "../../application";

import { Request, Response } from "express";
import { fileDelete } from "../../../shared/utils/deleteFile";
import { uploadBook } from "../../../shared/utils/uploadBook";
import { uploadCoverImage } from "../../../shared/utils/uploadCoverImage";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { deleteBookInCloudinary } from "../../../shared/utils/deleteBookInCloudinary";
import { BookBase, BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BookCover } from "../../../shared/types/bookTypes/bookTypes";
import { ContentBook } from "../../../shared/types/bookTypes/contentBookTypes";
import { PrismaCrudRepository } from "../../infrastructure/mongo";
import { FindAndDeleteUser, FindByID } from "../../../userService/application/service/FindAndDelete.service";
import { UserFindById } from "../../../userService/infrastructure/userRespositoryMongo";
import { FindByIdRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";

const mongoCrudRepo = new PrismaCrudRepository();
const createService = new CreateBook(mongoCrudRepo);
const deleteService = new DeleteBook(mongoCrudRepo);
const getAllService = new GetAllBooks(mongoCrudRepo);
const getAllByLevelService = new GetAllBooksByLevel(mongoCrudRepo);
const getByIdService = new GetBooksById(mongoCrudRepo);
const updateService = new UpdateBooksById(mongoCrudRepo);

const findUserByIdPrisma: FindByIdRepo = new UserFindById()
const findUserService: FindByID = new FindByID(findUserByIdPrisma)

// Helper: parsea un campo que puede llegar como string JSON, string simple, o array
function parseArrayField(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    // Cada elemento del array puede ser a su vez un string JSON
    return value.flatMap((item) => {
      if (typeof item === "string") {
        try {
          const parsed = JSON.parse(item);
          return Array.isArray(parsed) ? parsed : [item];
        } catch {
          return [item];
        }
      }
      return [String(item)];
    });
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }
  return [];
}

export class BooksCrudController {
  // 🔄️
  async createBook(req: Request, res: Response): Promise<Response> {
    try {

      const {
        title,
        summary,
        available,
        language,
        yearBook,
        synopsis,
        genre,
        level,
        format,
        totalPages,
        duration,
        fileExtension,
        anthology,
      }: BookBase = req.body;
      console.log(title,
        summary,
        available,
        language,
        yearBook,
        synopsis,
        genre,
        level,
        format,
        totalPages,
        duration,
        fileExtension,
        anthology)

      // Parsear campos que pueden llegar como strings JSON desde multipart/form-data
      const authorIds: string[] = parseArrayField(req.body.authorIds);
      const subgenre: string[] = parseArrayField(req.body.subgenre);
      const theme: string[] = parseArrayField(req.body.theme);

      const files = req.files as {
        [key: string]: Express.Multer.File[];
      };
      console.log(files)

      const img = files.img[0];
      const file = files.file[0];



      const content = await uploadBook(file.path);
      const coverImage = await uploadCoverImage(img.path);
      console.log(coverImage)

      if (!coverImage || !content) {
        await fileDelete(img.path);
        await fileDelete(file.path);
        console.log("no file in clou")
        if (coverImage && coverImage.public_id !== undefined) await deleteCoverImage(coverImage.public_id);
        if (content && content.public_id !== undefined) await deleteBookInCloudinary(content.public_id);
        console.log("no se pudo almacenar el contenido o la portada del libro")
        return res.status(400).json({ msg: "no se pudo almacenar el contenido o la portada del libro" });
      }

      const newBook = {
        title,
        summary,
        subgenre,
        language,
        available,
        contentBookId: content.public_id,
        contentBookUrl: content.secure_url,
        coverImageId: coverImage.public_id,
        coverImageUrl: coverImage.secure_url,
        authorIds,
        contentBook: {
          idContentBook: content.public_id,
          url_secura: content.secure_url,
        },
        bookCoverImage: {
          url_secura: coverImage.secure_url,
          idBookCoverImage: coverImage.public_id,
        },
        synopsis,
        yearBook,
        theme,
        genre,
        level,
        format,
        fileExtension,
        totalPages,
        duration,
        anthology,
      };
      console.log(newBook)
      await createService.run(newBook as any);

      await fileDelete(img.path);
      await fileDelete(file.path);
      return res.status(200).json({ msg: "libro subido correctamente" });
    } catch (error) {
      return res.status(500).json({ msg: "Error inesperado por favor intente de nuevo mas tarde" });
    }
  }

  // ✅
  async getAllBook(req: Request, res: Response): Promise<Response> {
    try {

      const reqUser = req.user;


      const user = await findUserService.findByID(reqUser.id);

      if (user) {

        const books = await getAllByLevelService.run(user.level);
        return res.status(200).json({ msg: "books for level ", books })
      }
      const books = await getAllService.run();
      return res.status(200).json(books);

    } catch (error) {
      console.log();
      console.log(error);
      console.log();
      return res.status(500).json({
        msg: "Erro inesperado por favor intente de nuevo mas tarde",
      });
    }
  }

  // ✅
  async deleteBook(req: Request, res: Response): Promise<Response> {
    try {

      const id = req.params.id;



      const book: BookSearch | null = await deleteService.run(id);

      if (!book) return res.status(404).json({ msg: "no se encontró el libro para eliminar" });

      const isDeletingCoverImage: boolean = await deleteCoverImage(book.bookCoverImage.idBookCoverImage);

      const isDeletingBook: boolean = await deleteBookInCloudinary(book.contentBook.idContentBook);

      if (!isDeletingCoverImage || !isDeletingBook)
        console.warn("Ocurrió un error al eliminar la documentación en Cloudinary. Verifica si siguen existiendo.");

      await deleteService.run(id);

      return res.status(200).json({ msg: "libro eliminado correctamente" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        msg: "Erro inesperado por favor intente de nuevo mas tarde",
      });
    }
  }

  // ✅
  async getBookById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const book = await getByIdService.run(id);

      if (!book) return res.status(200).json({ msg: "libro no encontrado" });

      return res.json(book);
    } catch (error) {

      console.log();
      console.log(error);
      console.log();
      return res.status(500).json({ msg: "Erro inesperado por favor intente de nuevo mas tarde" });
    }
  }

  //✅
  async updateBookById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const {
        title,
        summary,
        available,
        language,
        yearBook,
        synopsis,
        theme,
        genre,
        level,
        format,
        totalPages,
        duration,
        fileExtension,
      }: BookBase = req.body;

      // Parsear authorIds y subgenre (pueden llegar como strings JSON desde multipart/form-data)
      const authorIds: string[] = parseArrayField(req.body.authorIds);
      const subgenre: string[] = parseArrayField(req.body.subgenre);

      const existingBook: BookSearch | null = await getByIdService.run(id);
      if (!existingBook) return res.status(404).json({ msg: "no se encontró el libro para actualizar" });

      const files = req.files as {
        [key: string]: Express.Multer.File[];
      };

      let coverImage: BookCover = existingBook.bookCoverImage;
      let contentBook: ContentBook = existingBook.contentBook;

      if (files && files.img && files.img.length > 0) {
        const img = files.img[0];
        const newCoverImage = await uploadCoverImage(img.path);

        if (newCoverImage) {
          const isDeletingCoverImage: boolean = await deleteCoverImage(existingBook.bookCoverImage.idBookCoverImage);

          if (!isDeletingCoverImage)
            console.warn("Ocurrió un error al eliminar la portada en Cloudinary. Verifica si sigue existiendo.");

          coverImage = {
            url_secura: newCoverImage.secure_url,
            idBookCoverImage: newCoverImage.public_id,
          };
        }

        await fileDelete(img.path);
      }

      if (files && files.file && files.file.length > 0) {
        const file = files.file[0];

        const newContent = await uploadBook(file.path);

        if (newContent) {
          const isDeletingBook: boolean = await deleteBookInCloudinary(existingBook.contentBook.idContentBook);

          if (!isDeletingBook)
            console.warn("Ocurrió un error al eliminar el libro en Cloudinary. Verifica si sigue existiendo.");

          contentBook = {
            idContentBook: newContent.public_id,
            url_secura: newContent.secure_url,
          };
        }
        await fileDelete(file.path);
      }

      const updatedBook = {
        _id: existingBook.id,
        title: title || existingBook.title,
        authorIds: authorIds.length > 0 ? authorIds : [],
        summary: summary || existingBook.summary,
        subgenre: subgenre.length > 0 ? subgenre : existingBook.subgenre,
        available: available !== undefined ? available : existingBook.available,
        language: language || existingBook.language,
        yearBook: yearBook || existingBook.yearBook,
        synopsis: synopsis || existingBook.synopsis,
        theme: (theme as unknown as string[]) || existingBook.theme,
        genre: genre || existingBook.genre,
        level: level || existingBook.level,
        format: format || existingBook.format,
        totalPages: totalPages || existingBook.totalPages,
        duration: duration || existingBook.duration,
        fileExtension: fileExtension || existingBook.fileExtension,
        bookCoverImage: coverImage || existingBook.bookCoverImage,
        contentBook: contentBook || existingBook.contentBook,
        // Campos requeridos por el repositorio Prisma
        contentBookId: contentBook.idContentBook,
        contentBookUrl: contentBook.url_secura,
        coverImageId: coverImage.idBookCoverImage,
        coverImageUrl: coverImage.url_secura,
      };

      await updateService.run(id, updatedBook);

      return res.status(200).json({ msg: "libro actualizado correctamente" });
    } catch (error) {

      console.log();
      console.log(error);
      return res.status(500).json({ msg: "Error inesperado por favor intente de nuevo mas tarde" });
    }
  }
}
