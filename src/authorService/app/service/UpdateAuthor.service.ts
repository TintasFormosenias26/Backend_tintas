import { Author } from "../../domain/entidades/author.Types";
import { FindAuthor } from "../../domain/ports/findAuthorRepository";
import { UpdateAuthorRepository } from "../../domain/ports/updateAuthorRepository";



export class UpdateAuthor implements UpdateAuthorRepository {
    constructor(private readonly updateAuthors: UpdateAuthorRepository,
        private readonly uniqueAuthor: FindAuthor,
    ) { }

    async updateAuthor(id: any, author: Partial<Author>): Promise<Author> {
        if (author.fullName) {
            const authorExist = await this.uniqueAuthor.findByName(author.fullName);

            if (
                authorExist &&
                authorExist.id &&
                authorExist.id.toString() !== id.toString()
            ) {
                throw new HttpError(409, "Ya existe un autor con ese nombre.");
            }
        }

        const updated = await this.updateAuthors.updateAuthor(id, author);

        if (!updated) {
            throw new HttpError(404, "Autor no encontrado.");
        }

        return updated;
    }
}
export class HttpError extends Error {
    constructor(
        public statusCode: number,
        message: string
    ) {
        super(message);
    }
}
