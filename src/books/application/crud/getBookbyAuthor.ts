import { BooksAuthorRepository } from "../../domain/booksAuthorRepository";
import { Books } from "../../domain/entities/books";



export class GetBookByAuthor {
    constructor(private repe: BooksAuthorRepository) { }

    async getByAuthor(author: string): Promise<Books[]> {
        return await this.repe.getBookByAuthorId(author)
    }
}