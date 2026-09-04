import { deleteProgress } from '../../domain/ports/deleteProgress.Ports'

export class DeleteProgresService implements deleteProgress {
    constructor(
        private readonly bookRepo: deleteProgress
    ) {

    }
    async deleteProgres(id: string, userId: string): Promise<boolean> {
        return this.bookRepo.deleteProgres(id, userId)
    }
}
