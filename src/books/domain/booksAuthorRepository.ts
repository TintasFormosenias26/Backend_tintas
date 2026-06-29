// repositories/booksAuthorRepository.ts

import { Books } from "./entities/books";

export interface BooksAuthorRepository {
  getBookByAuthorId(idAuthor: String): Promise<Books[]>;
}