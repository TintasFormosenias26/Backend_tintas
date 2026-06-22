
export interface BookContentRepository {
  createBookContent(id: String, title: string, text: { page: number; content: string }[]): Promise<void>;
}
