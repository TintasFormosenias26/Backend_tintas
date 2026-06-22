// repositories/booksAuthorRepository.ts
import { BookSearch } from "../../shared/types/bookTypes/bookTypes";

export interface BooksAuthorRepository {
  getBookByAuthorId(idAuthor: String): Promise<BookSearch[]>;
}