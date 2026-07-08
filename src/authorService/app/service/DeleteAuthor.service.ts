import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { DeleteAuthor } from "../../domain/ports/deleteAuthorRepository";
import { FindAuthor } from "../../domain/ports/findAuthorRepository";
import { HttpError } from "./UpdateAuthor.service";

export class DeleteAuthors implements DeleteAuthor {
    constructor(
        private readonly deleteAuthors: DeleteAuthor,
        private readonly findAthors: FindAuthor
    ) { }
    async deleteAuthor(id: any): Promise<void> {
        const author = await this.findAthors.findById(id);
        if (!author) {
            console.warn("author not found")
            throw new HttpError(404, "author not found.");
        }

        if (author.photoIdImage) {
            const deleted = await deleteCoverImage(author.photoIdImage);
            if (!deleted) {
                console.warn(`No se pudo eliminar la imagen de Cloudinary: ${author.photoIdImage}`);
                throw new HttpError(302, "No se pudo eliminar la imagen de Cloudinary.");

            }
        }
        await this.deleteAuthors.deleteAuthor(id)
    }
}

