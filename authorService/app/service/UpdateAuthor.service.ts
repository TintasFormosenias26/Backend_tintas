import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { Author } from "../../domain/entidades/author.Types";
import { FindAuthor } from "../../domain/ports/findAuthorRepository";
import { UpdateAuthorRepository } from "../../domain/ports/updateAuthorRepository";



export class UpdateAuthor implements UpdateAuthorRepository {
    constructor(private readonly updateAuthors: UpdateAuthorRepository,
        private readonly uniqueAuthor: FindAuthor,
    ) { }

    async updateAuthor(id: any, author: Author): Promise<Author | null> {
        /* const imageId = (author as any).id_image;
         if (imageId) {
             const result = await deleteCoverImage(imageId);
             if (!result) {
                 return null;
             }
         }
 */
        if (author.fullName) {
            const authorExist = await this.uniqueAuthor.findByName(author.fullName);

            if (authorExist && authorExist.id && authorExist.id.toString() !== id.toString()) {
                return null;
            }
        }
        return await this.updateAuthors.updateAuthor(id, author);
    }
}