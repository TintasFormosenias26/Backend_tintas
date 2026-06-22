import { CreateBookContent } from "../../bookContent/application/createBookContent";
import { PrismaRepositoryBookContent } from "../../bookContent/infrastructure/moongoRepositoryBookContent";

const bookContentRepository = new PrismaRepositoryBookContent();

export const serviceContainer = {

  bookContent: {
    createBookContent: new CreateBookContent(bookContentRepository),
  },
};
