import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksCrudRepository } from "../../domain/booksCrudRepository";

export class DeleteBook {
  constructor(private repository: BooksCrudRepository) { }

  async run(id: String): Promise<void> {
    await this.repository.deleteBook(id);
  }
}
