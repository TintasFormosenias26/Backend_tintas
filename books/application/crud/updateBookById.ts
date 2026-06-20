import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { BooksCrudRepository } from "../../domain/booksCrudRepository";
import { Books } from "../../domain/entities/books";

export class UpdateBooksById {
     constructor(private repository: BooksCrudRepository) { }
     async run(id: string, book: Partial<BookSearch>) {
          await this.repository.updateBookById(id, book as any);
     }
}