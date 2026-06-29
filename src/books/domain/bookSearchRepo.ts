import { Books } from "./entities/books";
import { BookSearchType } from "./entities/bookSearch";

export interface BookSearchRepository {

    search(filters: BookSearchType): Promise<Books[]>;

}