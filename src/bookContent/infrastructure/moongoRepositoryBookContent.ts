import { prisma } from "../../shared/lib/prisma";
import { BookContentRepository } from "../domain/bookContentRepository";


export class PrismaRepositoryBookContent implements BookContentRepository {

  async createBookContent(
    id: string,
    title: string,
    text: { page: number; content: string }[]
  ): Promise<void> {

    const book = await prisma.book.create({
      data: ({
        id,
        title,
      } as any),
    });

    await prisma.bookContent.createMany({
      data: text.map(t => ({
        page: t.page,
        content: t.content,
        bookId: book.id,
      })),
    });
  }
}