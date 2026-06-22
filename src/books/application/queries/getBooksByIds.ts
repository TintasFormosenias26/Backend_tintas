import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { GetBooksById } from "../crud/getBookById";

export class GetBooksByIds {
  constructor(private booksRepository: GetBooksById) { }

  async run(id: any): Promise<BookSearch | null> {
    return await this.booksRepository.run(id);
  }
}
