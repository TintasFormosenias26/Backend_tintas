import { BookSearch } from "../../../shared/types/bookTypes/bookTypes";
import { GetAllBooksByLevelRepo } from "../../domain/booksCrudRepository";

export class GetAllBooksByLevel {
    constructor(private readonly booksRepository: GetAllBooksByLevelRepo) { }

    async run(nivel?: string): Promise<BookSearch[]> {
        const books = await this.booksRepository.getAllBooksByLevel(nivel);

        return books;
    }
}
