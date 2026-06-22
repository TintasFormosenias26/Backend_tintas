;
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksCrudRepository } from "../../domain/booksCrudRepository";

export class GetAllBooksByLevel {
  static run(nivel: string | null): any {
    throw new Error("Method not implemented.");
  }
  constructor(private readonly booksRepository: BooksCrudRepository) { }

  async run(nivel?: string): Promise<BookSearch[]> {
    const books = await this.booksRepository.getAllBooksByLevel(nivel);

    return books;
  }
}
