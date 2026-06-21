

import { Author } from "../domain/entidades/author.Types";
import { FindAuthor } from "../domain/ports/findAuthorRepository";
import { ISaveAuthorRepository } from "../domain/ports/saveAuthorRepository";
import { UpdateAuthorRepository } from "../domain/ports/updateAuthorRepository";
import { DeleteAuthor } from "../domain/ports/deleteAuthorRepository";
import { deleteCoverImage } from "../../shared/utils/deleteCoverImage";
import { prisma } from "../../shared/lib/prisma";


// SAVE AUTHOR
export class SaveAuthorPostgresRepo implements ISaveAuthorRepository {
  async createAuthor(author: Author): Promise<false | Author> {
    const createdAuthor = await prisma.author.create({
      data: {
        fullName: author.fullName,
        biography: author.biography,
        profession: author.profession,
        birthdate: new Date(author.birthdate),
        birthplace: author.birthplace,
        nationality: author.nationality,
        itActivo: author.isActive,
        photoIdImage: author.photoIdImage!,
        photoUrl: author.photoUrl!,
        writingGenre: author.writingGenre ?? [],
      },
    });
    const result = new Author(
      createdAuthor.fullName,
      createdAuthor.biography,
      createdAuthor.profession,
      createdAuthor.birthdate,
      createdAuthor.birthplace,
      createdAuthor.nationality,
      createdAuthor.itActivo,
      author.writingGenre ?? [],
      createdAuthor.photoIdImage,
      createdAuthor.photoUrl,
      createdAuthor.id
    );

    return result;
  }
}

// UPDATE AUTHOR
export class UpdateAuthorPostgresRepo implements UpdateAuthorRepository {
  async updateAuthor(id: string, author: Partial<Author>): Promise<Author | null> {

    const currentAuthor = await prisma.author.findUnique({
      where: { id },
    });

    if (!currentAuthor) {
      return null;
    }
    /*
        if (
          author.photoIdImage &&
          currentAuthor.photoIdImage &&
          currentAuthor.photoIdImage !== author.photoIdImage
        ) {
          await deleteCoverImage(currentAuthor.photoIdImage);
        }
    */
    const updatedAuthor = await prisma.author.update({
      where: { id },
      data: {
        ...(author.fullName && { fullName: author.fullName }),
        ...(author.biography && { biography: author.biography }),
        ...(author.profession && { profession: author.profession }),
        ...(author.birthdate && {
          birthdate: new Date(author.birthdate),
        }),
        ...(author.birthplace && {
          birthplace: author.birthplace,
        }),
        ...(author.nationality && {
          nationality: author.nationality,
        }),
        ...(author.isActive !== undefined && {
          itActivo: author.isActive,
        }),
        ...(author.photoIdImage && {
          photoIdImage: author.photoIdImage,
        }),
        ...(author.photoUrl && {
          photoUrl: author.photoUrl,
        }),
        ...(author.writingGenre && {
          writingGenre: author.writingGenre,
        }),
      },
    });

    return {
      id: updatedAuthor.id,
      fullName: updatedAuthor.fullName,
      biography: updatedAuthor.biography,
      profession: updatedAuthor.profession,
      birthdate: updatedAuthor.birthdate,
      birthplace: updatedAuthor.birthplace,
      nationality: updatedAuthor.nationality,
      isActive: updatedAuthor.itActivo,
      photoIdImage: updatedAuthor.photoIdImage,
      photoUrl: updatedAuthor.photoUrl,
      writingGenre:
        (updatedAuthor as any).writingGenre ??
        (currentAuthor as any).writingGenre,
    };
  }
}


// FIND AUTHOR
const mapPrismaAuthorToDomain = (author: any): Author =>
  new Author(
    author.fullName,
    author.biography,
    author.profession,
    author.birthdate,
    author.birthplace,
    author.nationality,
    author.itActivo,
    author.writingGenre,
    author.photoIdImage,
    author.photoUrl,
    author.id
  );

export class FindAuthorPostgresRepo implements FindAuthor {

  async findById(id: string): Promise<Author | null> {
    const result = await prisma.author.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    return mapPrismaAuthorToDomain(result);
  }

  async findByName(name: string): Promise<Author | null> {
    const result = await prisma.author.findFirst({
      where: {
        fullName: name,
      },
    });

    if (!result) {
      return null;
    }

    return mapPrismaAuthorToDomain(result);
  }

  async findAuthor(): Promise<Author[]> {
    const results = await prisma.author.findMany();
    return results.map(mapPrismaAuthorToDomain);
  }
}


// DELETE AUTHOR
export class DeleteAuthorPostgresRepo implements DeleteAuthor {

  async deleteAuthor(id: string): Promise<void | null> {

    const result = await prisma.author.findUnique({
      where: { id },
    });

    if (!result) {
      return null;
    }

    if (result.photoIdImage) {
      await deleteCoverImage(result.photoIdImage);
    }

    await prisma.author.delete({
      where: { id },
    });
  }
}



