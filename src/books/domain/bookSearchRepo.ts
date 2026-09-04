import { BookSearchType } from "./entities/bookSearch";

export interface BookSearchRepository {

    search(filters: BookSearchType): Promise<unknown[]>;

}
