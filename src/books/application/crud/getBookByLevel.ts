import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksQueryRepository } from "../../domain/booksQueryRepository";

export class GetAllBooksByLevel {
    constructor(private readonly booksRepository: BooksQueryRepository) { }

    async run(nivel?: string): Promise<BookSearch[]> {
        const books = await this.booksRepository.getAllBooksByLevel(nivel);

        return books;
    }
}
