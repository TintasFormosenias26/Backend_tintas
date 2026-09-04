import {
  CreateBook,
  DeleteBook,
  GetAllBooks,
  GetBooksById,
  UpdateBooksById,
} from "../../application";

import { NextFunction, Request, Response } from "express";
import { fileDelete } from "../../../shared/utils/deleteFile";
import { uploadBook } from "../../../shared/utils/uploadBook";
import { uploadCoverImage } from "../../../shared/utils/uploadCoverImage";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { deleteBookInCloudinary } from "../../../shared/utils/deleteBookInCloudinary";
import { BookBase, BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BookCover } from "../../../shared/types/bookTypes/bookTypes";
import { ContentBook } from "../../../shared/types/bookTypes/contentBookTypes";
import { PrismaCrudRepository } from "../../infrastructure/mongo";
import { FindByID } from "../../../userService/application/service/FindAndDelete.service";
import { UserFindById } from "../../../userService/infrastructure/userRespositoryMongo";
import { FindByIdRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";
import { GetAllBooksByLevel } from "../../application/crud/getBookByLevel";
import { sendError } from "../../../shared/middlewares/errorHandler";

const mongoCrudRepo = new PrismaCrudRepository();
const createService = new CreateBook(mongoCrudRepo);
const deleteService = new DeleteBook(mongoCrudRepo);
const getAllService = new GetAllBooks(mongoCrudRepo);
const getAllByLevelService = new GetAllBooksByLevel(mongoCrudRepo);
const getByIdService = new GetBooksById(mongoCrudRepo);
const updateService = new UpdateBooksById(mongoCrudRepo);

const findUserByIdPrisma: FindByIdRepo = new UserFindById()
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
  async createBook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
      // Parsear campos que pueden llegar como strings JSON desde multipart/form-data
      const authorIds: string[] = parseArrayField(req.body.authorIds);
      const subgenre: string[] = parseArrayField(req.body.subgenre);
      const theme: string[] = parseArrayField(req.body.theme);

      const files = req.files as {
        [key: string]: Express.Multer.File[];
      };

      const img = files.img[0];
      const file = files.file[0];



      const content = await uploadBook(file.path);
      const coverImage = await uploadCoverImage(img.path);

      if (!coverImage || !content) {
        await fileDelete(img.path);
        await fileDelete(file.path);
        if (coverImage && coverImage.public_id !== undefined) await deleteCoverImage(coverImage.public_id);
        if (content && content.public_id !== undefined) await deleteBookInCloudinary(content.public_id);
        return sendError(res, 502, "UPLOAD_SERVICE_ERROR", "No se pudo almacenar el archivo del libro.");
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
      await createService.run(newBook as any);

      await fileDelete(img.path);
      await fileDelete(file.path);
      return res.status(201).json({ success: true, message: "Libro creado correctamente." });
    } catch (error) {
      return next(error);
    }
  }

  // ✅
  async getAllBook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      let book;
      const id = req.user?.id;
      if (!id) return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
      const findUserService: FindByID = new FindByID(findUserByIdPrisma)
      const user = await findUserService.findByID(id)
      if (user) {
        book = await getAllByLevelService.run(user.level)
        return res.status(200).json(book)
      }
      book = await getAllService.run();
      return res.status(200).json(book);


    } catch (error) {
      return next(error);
    }
  }

  // ✅
  async deleteBook(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const book = await getByIdService.run(id);

      if (!book) return sendError(res, 404, "BOOK_NOT_FOUND", "No se encontró el libro.");


      const isDeletingCoverImage: boolean = await deleteCoverImage(book.bookCoverImage.idBookCoverImage);

      const isDeletingBook: boolean = await deleteBookInCloudinary(book.contentBook.idContentBook);

      if (!isDeletingCoverImage || !isDeletingBook)
        console.warn("Ocurrió un error al eliminar la documentación en Cloudinary. Verifica si siguen existiendo.");

      await deleteService.run(id);

      return res.status(200).json({ success: true, message: "Libro eliminado correctamente." });
    } catch (error) {
      return next(error);
    }
  }

  // ✅
  async getBookById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const book = await getByIdService.run(id);

      if (!book) return sendError(res, 404, "BOOK_NOT_FOUND", "No se encontró el libro.");

      return res.json(book);
    } catch (error) {

      return next(error);
    }
  }

  //✅
  async updateBookById(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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
      if (!existingBook) return sendError(res, 404, "BOOK_NOT_FOUND", "No se encontró el libro.");

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

      return res.status(200).json({ success: true, message: "Libro actualizado correctamente." });
    } catch (error) {
      return next(error);
    }
  }
}
