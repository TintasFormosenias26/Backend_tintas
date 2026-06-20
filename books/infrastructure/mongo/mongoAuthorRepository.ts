import { prisma } from "../../../shared/lib/prisma";
import { BooksAuthorRepository } from "../../domain/booksAuthorRepository";


export class PrismaAuthorRepository implements BooksAuthorRepository {

     async getBookByAuthorId(authorId: string): Promise<any[]> {

          const books = await prisma.book.findMany({
               where: {
                    authors: {
                         some: {
                              id: authorId
                         }
                    }
               },
               include: {
                    authors: {
                         select: {
                              id: true,
                              fullName: true
                         }
                    }
               }
          });

          return books;
     }
}

