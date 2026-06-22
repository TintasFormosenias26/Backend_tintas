
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksCrudRepository, GetBookById } from "../../domain/booksCrudRepository";

export class GetBooksById {
  constructor(private repository: BooksCrudRepository) { }

  async run(id: string): Promise<BookSearch | null> {
    return await this.repository.getBookById(id);
  }
}
export class GetBooksByIdService implements GetBookById {
  constructor(private readonly findForId: GetBookById) { }
  async getBookById(id: String): Promise<BookSearch | null> {
    return await this.findForId.getBookById(id)
  }
}