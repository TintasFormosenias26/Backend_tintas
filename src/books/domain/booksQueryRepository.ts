
import { BookSearch } from "../../shared/types/bookTypes/bookTypes";

export interface BooksQueryRepository {
     getAllBooksByLevel(nivel?: string): Promise<BookSearch[]>;
}
export interface FilterBookRepository {
     getBooksByFiltering(
          theme: string[],
          subgenre: string[],
          yearBook: string[],
          genre: string[],
          format: string[],
          idAuthor: string[],
          level?: string
     ): Promise<BookSearch[]>;

}

