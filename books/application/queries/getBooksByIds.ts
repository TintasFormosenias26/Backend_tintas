import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksQueryRepository } from "../../domain/booksQueryRepository";

export class GetBooksByIds {
  constructor(private booksRepository: BooksQueryRepository) { }

  async run(ids: any[]): Promise<BookSearch[]> {
    return await this.booksRepository.getBooksByIds(ids);
  }
}
