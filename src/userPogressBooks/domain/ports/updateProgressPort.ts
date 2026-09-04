import { BookUserProgresRepo } from "../entities/BookPogress.types";

export interface UpdateProgresPort {
    updateProgres(id: string, userId: string, data: Partial<BookUserProgresRepo>): Promise<BookUserProgresRepo | null>
}
