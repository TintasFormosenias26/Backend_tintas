import { BookContentRepository } from "../domain/bookContentRepository";

export class CreateBookContent {
  constructor(private repository: BookContentRepository) { }

  async run(id: String, title: string, text: { page: number; content: string }[]): Promise<void> {
    await this.repository.createBookContent(id, title, text);
  }
}
