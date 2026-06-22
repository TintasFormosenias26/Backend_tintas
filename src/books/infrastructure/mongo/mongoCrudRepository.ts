import { BooksCrudRepository, GetBookById } from "../../domain/booksCrudRepository";
import { Books } from "../../domain/entities/books";
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { serviceContainer } from "../../../shared/services/serviceContainer";
import { prisma } from "../../../shared/lib/prisma";
import { Level } from "../../../prisma/generated/enums";

export class PrismaCrudRepository implements BooksCrudRepository {

  // Helper method to map Prisma book data to BookSearch type
  private mapToBookSearch(book: any): BookSearch {
    return {
      id: book.id,
      __v: 0, // Prisma doesn't use __v like MongoDB
      title: book.title,
      author: [], // Will be populated from authors relation
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
      },
    });

    if (updated.genre === "Narrativo") {
      const url = updated.contentBookUrl ?? "";
      const title = updated.title;

      await serviceContainer.bookContent.createBookContent.run(
        updated.id,
        title,
        [
          {
            page: 1,
            content: url,
          },
        ]
      );
    }
  }

  // =========================
  // GET ALL BOOKS
  // =========================
  async getAllBooks(): Promise<BookSearch[]> {

    const books = await prisma.book.findMany({
      include: {
        authors: true,
        contents: true,
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
        contents: true,
      },
    });

    return book ? this.mapToBookSearch(book) : null;
  }
  async getAllBooksByLevel(nivel: string): Promise<BookSearch[]> {
    const levelHierarchy: Record<string, string[]> = {
      "Inicial": ["Inicial"],
      "Secundario": ["Secundario", "Inicial"],
      "Joven Adulto": ["Joven Adulto", "Secundario", "Inicial"],
      "Adulto Mayor": ["Adulto Mayor", "Joven Adulto", "Secundario", "Inicial"]
    };

    const allowedLevels =
      levelHierarchy[nivel] ??
      ["Inicial", "Secundario", "Joven Adulto", "Adulto Mayor"];

    const result = await prisma.book.findMany({
      where: {
        level: {
          in: allowedLevels as any
        }
      },
      include: {
        authors: {
          select: {
            id: true,
            fullName: true
          }
        }
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
        contents: true,
      },
    });

    return book ? this.mapToBookSearch(book) : null;
  }
  mapToBookSearch(book: { authors: { id: string; fullName: string; biography: string; profession: string; birthdate: Date; birthplace: string; nationality: string; isActivo: boolean; photoIdImage: string; photoUrl: string; }[]; contents: { id: string; page: number; content: string; bookId: string; }[]; } & { title: string; summary: string; synopsis: string; language: string; available: boolean; yearBook: string; genre: string; level: Level; format: string; fileExtension: string; contentBookId: string; contentBookUrl: string; coverImageId: string; coverImageUrl: string; theme: string[]; subgenre: string[]; totalPages: number | null; duration: number | null; anthology: boolean; id: string; createdAt: Date; updatedAt: Date; }): BookSearch | PromiseLike<BookSearch | null> | null {
    throw new Error("Method not implemented.");
  }
}