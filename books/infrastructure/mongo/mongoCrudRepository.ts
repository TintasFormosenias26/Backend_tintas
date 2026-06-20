import { BooksCrudRepository } from "../../domain/booksCrudRepository";
import { Books } from "../../domain/entities/books";
import { serviceContainer } from "../../../shared/services/serviceContainer";
import { prisma } from "../../../shared/lib/prisma";

export class PrismaCrudRepository implements BooksCrudRepository {

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

      const url = updated.contentBookUrl;

      const title = updated.title;

      await serviceContainer.bookContent.createBookContent.run(
        updated.id,
        title,
      );
    }
  }

  // =========================
  // GET ALL BOOKS
  // =========================
  async getAllBooks(): Promise<any[]> {

    return await prisma.book.findMany({
      include: {
        authors: true,
        contents: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // =========================
  // DELETE BOOK
  // =========================
  async deleteBook(id: string): Promise<any | null> {

    try {
      return await prisma.book.delete({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  // =========================
  // GET BOOK BY ID
  // =========================
  async getBookById(id: string): Promise<any | null> {

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        authors: true,
        contents: true,
      },
    });

    return book ?? null;
  }
  async getAllBooksByLevel(nivel: string): Promise<Books[] | null> {
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

    const booksWithAuthorIds = result.map((book: { authors: any[]; totalPages: any; }) => ({
      ...book,
      authorIds: book.authors.map(author => author.id),
      totalPages: book.totalPages ?? undefined,
    }));

    return booksWithAuthorIds as Books[] ?? null
  }
}