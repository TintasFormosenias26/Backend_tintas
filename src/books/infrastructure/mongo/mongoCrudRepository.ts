import { BooksCrudRepository, GetBookById } from "../../domain/booksCrudRepository";
import { Books } from "../../domain/entities/books";
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { prisma } from "../../../shared/lib/prisma";
import { Level } from "../../../prisma/generated/enums";

export class PrismaCrudRepository implements BooksCrudRepository {

  // Helper method to map Prisma book data to BookSearch type
  private mapToBookSearch(book: any): BookSearch {
    return {
      id: book.id,
      __v: 0, // Prisma doesn't use __v like MongoDB
      title: book.title,
      // Mapea los autores desde la relación de Prisma
      author: Array.isArray(book.authors)
        ? book.authors.map((a: any) => ({
          id: a.id,
          fullName: a.fullName,
          biography: a.biography,
          profession: a.profession,
          birthdate: a.birthdate,
          birthplace: a.birthplace,
          nationality: a.nationality,
          isActivo: a.isActivo,
          photoIdImage: a.photoIdImage,
          photoUrl: a.photoUrl,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        }))
        : [],
      summary: book.summary,
      subgenre: book.subgenre || [],
      language: book.language,
      available: book.available,
      yearBook: book.yearBook,
      synopsis: book.synopsis,
      theme: book.theme || [],
      genre: book.genre,
      level: book.level,
      format: book.format,
      totalPages: book.totalPages,
      duration: book.duration,
      anthology: book.anthology ?? false,
      fileExtension: book.fileExtension,
      contentBook: {
        idContentBook: book.contentBookId,
        url_secura: book.contentBookUrl,
      },
      bookCoverImage: {
        idBookCoverImage: book.coverImageId,
        url_secura: book.coverImageUrl,
      },
    } as unknown as BookSearch;
  }

  // =========================
  // CREATE BOOK
  // =========================
  async createBook(book: Books): Promise<void> {

    const authorConnect = Array.isArray(book.authorIds)
      ? book.authorIds.map((id: any) => ({ id }))
      : book.authorIds
        ? [{ id: book.authorIds }]
        : [];

    const created = await prisma.book.create({
      data: {
        title: book.title,
        summary: book.summary,
        synopsis: book.synopsis,

        language: book.language,
        available: book.available ?? true,

        yearBook: book.yearBook,

        genre: book.genre,
        level: book.level,

        format: book.format,
        fileExtension: book.fileExtension,

        totalPages: book.totalPages,
        duration: book.duration,

        anthology: book.anthology ?? false,

        contentBookId: book.contentBookId,
        contentBookUrl: book.contentBookUrl,

        coverImageId: book.coverImageId,
        coverImageUrl: book.coverImageUrl,

        theme: book.theme ?? [],
        subgenre: book.subgenre ?? [],

        ...(authorConnect.length > 0 ? { authors: { connect: authorConnect } } : {}),
      },
    });
    if (!created) {
      console.log("book not created")
    }
    /*
    ======LOGICA PARA JEUGOS CON IA====
        if (created.genre === "Narrativo") {
    
          const url = created.contentBookUrl;
    
          const text = await extractTextByPage(url);
          const title = created.title;
    
          await serviceContainer.bookContent.createBookContent.run(
            created.id,
            title,
            text
          );
        }*/
  }

  // =========================
  // UPDATE BOOK
  // =========================
  async updateBookById(id: string, book: Books): Promise<void> {


    const authorConnect = Array.isArray(book.authorIds)
      ? book.authorIds.map((id: any) => ({ id }))
      : book.authorIds
        ? [{ id: book.authorIds }]
        : [];
    const currentBook = await prisma.book.findUnique({
      where: { id: id },
      include: {
        authors: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!currentBook) {
      throw new Error("Libro no encontrado");
    }

    const currentAuthorIds = currentBook.authors.map(a => a.id);

    const newAuthors = authorConnect.filter(
      author => !currentAuthorIds.includes(author.id)
    );


    const updated = await prisma.book.update({
      where: { id },
      data: {
        title: book.title,
        summary: book.summary,
        synopsis: book.synopsis,
        language: book.language,
        available: book.available,
        yearBook: book.yearBook,
        genre: book.genre,
        level: book.level,
        format: book.format,
        fileExtension: book.fileExtension,
        totalPages: book.totalPages,
        duration: book.duration,
        anthology: book.anthology,
        contentBookId: book.contentBookId,
        contentBookUrl: book.contentBookUrl,
        coverImageId: book.coverImageId,
        coverImageUrl: book.coverImageUrl,
        theme: book.theme,
        subgenre: book.subgenre,

        ...(authorConnect.length > 0 && {
          authors: {
            set: authorConnect,
          },
        }),
      },
    });
  }
  // =========================
  // GET ALL BOOKS
  // =========================
  async getAllBooks(): Promise<BookSearch[]> {

    const books = await prisma.book.findMany({
      include: {
        authors: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return books.map(book => this.mapToBookSearch(book));
  }

  // =========================
  // DELETE BOOK
  // =========================
  async deleteBook(id: string): Promise<BookSearch | null> {

    try {
      const book = await prisma.book.delete({
        where: { id },
      });
      return this.mapToBookSearch(book);
    } catch {
      return null;
    }
  }

  // =========================
  // GET BOOK BY ID
  // =========================
  async getBookById(id: string): Promise<BookSearch | null> {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: true,
      },
    });

    return book ? this.mapToBookSearch(book) : null;
  }
  async getAllBooksByLevel(nivel: Level): Promise<BookSearch[]> {
    const levelHierarchy: Record<string, Level[]> = {
      "INICIAL": ["INICIAL"],
      "SECUNDARIO": ["SECUNDARIO", "INICIAL"],
      "JOVEN_ADULTO": ["JOVEN_ADULTO", "SECUNDARIO", "INICIAL"],
      "ADULTO_MAYOR": ["ADULTO_MAYOR", "JOVEN_ADULTO", "SECUNDARIO", "INICIAL"]
    };

    const allowedLevels =
      levelHierarchy[nivel] ??
      ["ADULTO_MAYOR", "JOVEN_ADULTO", "SECUNDARIO", "INICIAL"];

    const result = await prisma.book.findMany({
      where: {
        level: {
          in: allowedLevels as any
        }
      },
      include: {
        authors: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return result.map(book => this.mapToBookSearch(book));
  }
}
export class GetBooksByIdPrisma implements GetBookById {
  async getBookById(id: string): Promise<BookSearch | null> {

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: true,
      },
    });

    return book ? this.mapToBookSearch(book) : null;
  }
  mapToBookSearch(book: any): BookSearch | PromiseLike<BookSearch | null> | null {
    throw new Error("Method not implemented.");
  }
}