import { prisma } from "../../../shared/lib/prisma";
import { BookSearchType } from "../../domain/entities/bookSearch";

export class PrismaBookRepository {

    async search(filters: BookSearchType) {
        console.log("ENTRÉ AL SEARCH");
        const where: any = {};

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
        console.log(JSON.stringify(where, null, 2));
        return prisma.book.findMany({
            where,
            include: {
                authors: true
            },
        });

    }

}