import { Books } from "./entities/books";
import { BookSearch } from "../../shared/types/bookTypes/bookTypes";

export interface BooksCrudRepository {
     createBook(book: Books): Promise<void>;
     getAllBooks(): Promise<BookSearch[]>;
     updateBookById(id: String, book: Partial<Books>): Promise<void>;
     deleteBook(id: String): Promise<BookSearch | null>;
     getBookById(id: String): Promise<BookSearch | null>;
}
export interface GetAllBooksByLevelRepo {
     getAllBooksByLevel(nivel?: string): Promise<BookSearch[]>;

}
export interface GetBookById {
     getBookById(id: String): Promise<BookSearch | null>;
}