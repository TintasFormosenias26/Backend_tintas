
import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksCrudRepository } from "../../domain/booksCrudRepository";

export class GetBooksById {
  constructor(private repository: BooksCrudRepository) { }

  async run(id: string): Promise<BookSearch | null> {
    return await this.repository.getBookById(id);
  }
}
