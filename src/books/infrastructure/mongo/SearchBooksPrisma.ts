import { prisma } from "../../../shared/lib/prisma";
import { BookSearchType } from "../../domain/entities/bookSearch";
import type { Prisma } from "../../../prisma/generated/client";
import type { BookSearchRepository } from "../../domain/bookSearchRepo";

export class PrismaBookRepository implements BookSearchRepository {

    async search(filters: BookSearchType) {
        const where: Prisma.BookWhereInput = {};

        if (filters.title) {
            where.title = {
                contains: filters.title,
                mode: "insensitive",
            };
        }

        if (filters.synopsis) {
            where.synopsis = {
                contains: filters.synopsis,
                mode: "insensitive",
            };
        }

        if (filters.language) {
            where.language = filters.language;
        }

        if (filters.available !== undefined) {
            where.available = filters.available;
        }

        if (filters.yearBook) {
            where.yearBook = filters.yearBook;
        }

        if (filters.genre) {
            where.genre = filters.genre;
        }

        if (filters.level) {
            where.level = filters.level;
        }

        if (filters.format) {
            where.format = filters.format;
        }
        if (filters.anthology !== undefined) {
            where.anthology = filters.anthology;
        }

        if (filters.theme?.length) {
            where.theme = {
                hasSome: filters.theme,
            };
        }

        if (filters.subgenre?.length) {
            where.subgenre = {
                hasSome: filters.subgenre,
            };
        }
        if (filters.authorName) {
            where.authors = {
                some: {
                    fullName: {
                        contains: filters.authorName,
                        mode: "insensitive",
                    },
                },
            };
        }
        return prisma.book.findMany({
            where,
            include: {
                authors: true
            },
        });

    }

}
