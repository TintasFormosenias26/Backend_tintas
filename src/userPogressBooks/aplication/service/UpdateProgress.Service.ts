import { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import { FindProgressPort } from "../../domain/ports/findProgres";
import { UpdateProgresPort } from "../../domain/ports/updateProgressPort";

export class UpdateProgressService implements UpdateProgresPort {
    constructor(
        private readonly progresRepo: UpdateProgresPort,
        private readonly findProgreso: FindProgressPort,
    ) { }

    async updateProgres(
        id: string,
        userId: string,
        data: Partial<BookUserProgresRepo>
    ): Promise<BookUserProgresRepo | null> {

        const progreso = await this.findProgreso.findById(id, userId);
        if (!progreso) return null;


        if (data.percent === 100 && progreso.status !== "finished") {
            data.status = "finished";
        }


        if (data.status === "finished") {
            data.finishDate = new Date();


            return await this.progresRepo.updateProgres(id, userId, data);
        }

        return await this.progresRepo.updateProgres(id, userId, data);
    }
}
