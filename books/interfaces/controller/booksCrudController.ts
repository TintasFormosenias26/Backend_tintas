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
import { separator } from "../../../shared/utils/consoleSeparator";
import { BookBase, BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BookCover } from "../../../shared/types/bookTypes/bookTypes";
import { ContentBook } from "../../../shared/types/bookTypes/contentBookTypes";
import { PrismaCrudRepository } from "../../infrastructure/mongo";
import { prisma } from "../../../shared/lib/prisma";

const mongoCrudRepo = new PrismaCrudRepository();
const createService = new CreateBook(mongoCrudRepo);
const deleteService = new DeleteBook(mongoCrudRepo);
const getAllService = new GetAllBooks(mongoCrudRepo);
/*const getByIdService = new GetBooksById(mongoCrudRepo);*/
const updateService = new UpdateBooksById(mongoCrudRepo);


export class BooksCrudController {
  // 🔄️
  async createBook(req: Request, res: Response): Promise<Response> {
    try {
      const idUser = req.user.id;

      const {
        title,
        author,
        summary,
        subgenre,
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
        anthology,
      }: BookBase = req.body;

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
        return res.status(400).json({ msg: "no se pudo almacenar el contenido o la portada del libro" });
      }

      const newBook = {
        title,
        summary,
        author,
        subgenre,
        language,
        available,
        // Flat fields expected by the Books type
        contentBookId: content.public_id,
        contentBookUrl: content.secure_url,
        coverImageId: coverImage.public_id,
        coverImageUrl: coverImage.secure_url,
        // Keep nested objects for backward compatibility
        contentBook: {
          idContentBook: content.public_id,
          url_secura: content.secure_url,
        },
        bookCoverImage: {
          url_secura: coverImage.secure_url,
          idBookCoverImage: coverImage.public_id,
        },
        // map authors to authorIds expected by repository
        authorIds: author,
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

      await createService.run(newBook);

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

      const id = req.user?.id;

      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          avatar: true,
          preference: true,
          progresses: true,
        },
      });

      if (!user) {
        console.log(
          "usuario con autenticación invalida se le proporcionara todos los libros para ver pero no para leer"
        );
        const books = await getAllService.run();
        return res.status(200).json(books);
      }



      let books;
      try {
        books = await GetAllBooksByLevel.run(user.nivel);
      } catch (err) {
        console.log("Error al obtener libros por nivel:", err);
        return res.status(500).json({
          msg: "Error al obtener libros por nivel",
        });
      }

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
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "id invalida" });

      const idValid = new mongoose.Types.ObjectId(id);

      const book = await getByIdService.run(idValid);

      if (!book) return res.status(200).json({ msg: "libro no encontrado" });

      const eventDataForMetric = {
        idBook: book._id as mongoose.Types.ObjectId,
        idAuthor: undefined,
        subgenre: undefined,
        format: undefined,
      };

      createMetric.exec(eventDataForMetric).catch((metricError: any) => {
        console.error("Error al crear la métrica:", metricError);
      });

      return res.json(book);
    } catch (error) {
      console.log(chalk.yellow("Error en el controlador: getBookById"));
      console.log(chalk.yellow(separator()));
      console.log();
      console.log(error);
      console.log();
      console.log(chalk.yellow(separator()));
      return res.status(500).json({ msg: "Erro inesperado por favor intente de nuevo mas tarde" });
    }
  }

  //✅
  async updateBookById(req: Request, res: Response): Promise<Response> {
    try {
      const id = req.params.id;

      const {
        title,
        author,
        summary,
        subgenre,
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

      if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({ msg: "id invalida" });
      const idValid = new mongoose.Types.ObjectId(id);

      const existingBook: BookSearch | null = await getByIdService.run(idValid);
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
        _id: existingBook._id,
        title: title || existingBook.title,
        author: author || existingBook.author,
        summary: summary || existingBook.summary,
        subgenre: subgenre || existingBook.subgenre,
        available: available !== undefined ? available : existingBook.available,
        language: language || existingBook.language,
        yearBook: yearBook || existingBook.yearBook,
        synopsis: synopsis || existingBook.synopsis,
        theme: theme || existingBook.theme,
        genre: genre || existingBook.genre,
        level: level || existingBook.level,
        format: format || existingBook.format,
        totalPages: totalPages || existingBook.totalPages,
        duration: duration || existingBook.duration,
        fileExtension: fileExtension || existingBook.fileExtension,
        bookCoverImage: coverImage || existingBook.bookCoverImage,
        contentBook: contentBook || existingBook.contentBook,
      };

      await updateService.run(idValid, updatedBook);

      return res.status(200).json({ msg: "libro actualizado correctamente" });
    } catch (error) {
      console.log(chalk.yellow("Error en el controlador: updateBook"));
      console.log(chalk.yellow(separator()));
      console.log();
      console.log(error);
      console.log();
      console.log(chalk.yellow(separator()));
      return res.status(500).json({ msg: "Error inesperado por favor intente de nuevo mas tarde" });
    }
  }
}
