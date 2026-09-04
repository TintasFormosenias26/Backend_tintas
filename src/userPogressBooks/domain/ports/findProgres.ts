import { BookUserProgresRepo } from "../entities/BookPogress.types";


export interface FindProgressPort {
    findByUser(userId: string): Promise<BookUserProgresRepo[]>
    findById(id: string, userId: string): Promise<BookUserProgresRepo | null>
    findByBook(bookId: string, userId: string): Promise<BookUserProgresRepo[]>
}
