import { BookSearchRepository } from "../../domain/bookSearchRepo";
import { BookSearchType } from "../../domain/entities/bookSearch";

export class SearchBookService {

    constructor(
        private readonly repository: BookSearchRepository
    ) { }

    async search(filters: BookSearchType) {
        return this.repository.search(filters);
    }

}