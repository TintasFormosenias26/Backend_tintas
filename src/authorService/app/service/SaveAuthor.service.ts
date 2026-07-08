import { Author } from "../../domain/entidades/author.Types";
import { FindAuthor } from "../../domain/ports/findAuthorRepository";
import { ISaveAuthorRepository } from "../../domain/ports/saveAuthorRepository";
import { HttpError } from "./UpdateAuthor.service";

export class CreateAuthor {
  constructor(private readonly saveAuthor: ISaveAuthorRepository, private readonly uniqueAuthor: FindAuthor) { }
  async saveAuthors(date: Author): Promise<Author | false> {
    const authorExist = await this.uniqueAuthor.findByName(date.fullName);

    if (
      authorExist
    ) {
      throw new HttpError(409, "Ya existe un autor con ese nombre.");
    }

    const saveAuthorsMogo = await this.saveAuthor.createAuthor(date);
    return saveAuthorsMogo
  }
}

