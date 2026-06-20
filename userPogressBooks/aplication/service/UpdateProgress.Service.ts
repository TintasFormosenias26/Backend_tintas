import { FindAndDeleteRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";
import { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import { BookUserProgresRepo } from "../../domain/entities/BookPogress.types";
import { FindProgressPort } from "../../domain/ports/findProgres";
import { UpdateProgresPort } from "../../domain/ports/updateProgressPort";

export class UpdateProgressService implements UpdateProgresPort {
    constructor(
        private readonly progresRepo: UpdateProgresPort,
        private readonly findProgreso: FindProgressPort,
        private readonly getUser: FindAndDeleteRepo,
        private readonly updateUser: UpdateUSerRepository
    ) { }

    async updateProgres(
        id: string,
        data: Partial<BookUserProgresRepo>
    ): Promise<BookUserProgresRepo | null> {

        const progreso = await this.findProgreso.findById(id);
        if (!progreso) return null;


        if (data.percent === 100 && progreso.status !== "finished") {
            console.log("status finalizado")
            data.status = "finished";
        }


        if (data.status === "finished") {
            data.finishDate = new Date();


            return await this.progresRepo.updateProgres(id, data);
        }

        return await this.progresRepo.updateProgres(id, data);
    }
}
