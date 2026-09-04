import { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import { FindProgressPort } from "../../domain/ports/findProgres";



export class FindProgresByID implements FindProgressPort {
    constructor(
        private readonly findProgress: FindProgressPort
    ) { }
    async findByUser(id: string): Promise<BookUserProgresRepo[]> {
        const progreso = await this.findProgress.findByUser(id)
        return progreso
    }
    async findByBook(id: string, idUser: string): Promise<BookUserProgresRepo[]> {
        const progreso = await this.findProgress.findByBook(id, idUser)
        return progreso
    }
    async findById(id: string, userId: string): Promise<BookUserProgresRepo | null> {
        return await this.findProgress.findById(id, userId)
    }
}
