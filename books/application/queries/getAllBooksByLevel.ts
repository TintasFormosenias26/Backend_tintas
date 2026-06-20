import { BooksQueryRepository } from "../../domain/booksQueryRepository";
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";

export class GetAllBooksByLevel {
  static run(nivel: string | null): any {
    throw new Error("Method not implemented.");
  }
  constructor(private readonly booksRepository: BooksQueryRepository) { }

  async run(nivel?: string): Promise<BookSearch[]> {
    const books = await this.booksRepository.getAllBooksByLevel(nivel);

    return books;
  }
}
