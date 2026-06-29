import { prisma } from "../../shared/lib/prisma";
import { BookUserProgresRepo } from "../domain/entities/BookPogress.types";
import { UpdateProgresPort } from "../domain/ports/updateProgressPort";
import { deleteProgress } from "../domain/ports/deleteProgress.Ports";
import { FindProgressPort } from "../domain/ports/findProgres";

export class BookProgresPostgres {
    async saveProgress(
        datos: BookUserProgresRepo
    ): Promise<BookUserProgresRepo> {
        const progress = await prisma.bookProgress.create({
            data: {
                user: {
                    connect: {
                        id: datos.idUser,
                    },
                },
                book: {
                    connect: {
                        id: datos.idBook,
                    },
                },
                unit: datos.unit!.toUpperCase() as any,
                position: datos.position,
                percent: datos.percent,
                total: datos.total,
                status: (datos.status ?? "READING").toUpperCase() as any,
                startDate: datos.startDate ?? new Date(),
                finishDate: datos.finishDate ?? null,
            },
        });

        return progress as unknown as BookUserProgresRepo;
    }


}
export class UpdateProgressPostgres implements UpdateProgresPort {
    async updateProgres(
        id: string,
        data: Partial<BookUserProgresRepo>
    ): Promise<BookUserProgresRepo | null> {
        try {
            const updateData = {
                ...data,
                status: data.status?.toUpperCase() as any,
                unit: data.unit?.toUpperCase() as any,
            };
            const result = await prisma.bookProgress.update({
                where: {
                    id,
                },
                data: updateData,
            });

            return result as unknown as BookUserProgresRepo;
        } catch {
            return null;
        }
    }
}

export class DeleteRepo implements deleteProgress {
    async deleteProgres(id: string): Promise<void> {
        await prisma.bookProgress.delete({
            where: {
                id,
            },
        });
    }
}
export class FindProgressPostgres implements FindProgressPort {
    async findByUser(id: string): Promise<BookUserProgresRepo[]> {
        return await prisma.bookProgress.findMany({
            where: {
                userId: id,
            }, include: {
                user: true,        // Incluye todos los campos del usuario
                book: true
            }
        }) as unknown as BookUserProgresRepo[];
    }
    async findByBook(
        id: string,
        idUser: string
    ): Promise<BookUserProgresRepo[]> {
        return await prisma.bookProgress.findMany({
            where: {
                bookId: id,
                userId: idUser,
            }, include: {
                user: true,        // Incluye todos los campos del usuario
                book: true        // Incluye todos los campos de los libros
            }
        }) as unknown as BookUserProgresRepo[];
    }

    async findById(
        id: string
    ): Promise<BookUserProgresRepo | null> {
        return await prisma.bookProgress.findUnique({
            where: {
                id,
            }, include: {
                user: true,        // Incluye todos los campos del usuario
                book: true        // Incluye todos los campos de los libros
            }
        }) as unknown as BookUserProgresRepo | null;
    }
}