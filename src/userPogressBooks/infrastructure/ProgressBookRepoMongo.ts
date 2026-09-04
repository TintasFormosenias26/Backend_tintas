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
        userId: string,
        data: Partial<BookUserProgresRepo>
    ): Promise<BookUserProgresRepo | null> {
        try {
            const updateData = {
                ...data,
                status: data.status?.toUpperCase() as any,
                unit: data.unit?.toUpperCase() as any,
            };
            return await prisma.$transaction(async (transaction) => {
                const updated = await transaction.bookProgress.updateMany({
                    where: { id, userId },
                    data: updateData,
                });
                if (updated.count !== 1) return null;
                return await transaction.bookProgress.findFirst({
                    where: { id, userId },
                }) as unknown as BookUserProgresRepo;
            });
        } catch {
            return null;
        }
    }
}

export class DeleteRepo implements deleteProgress {
    async deleteProgres(id: string, userId: string): Promise<boolean> {
        const result = await prisma.bookProgress.deleteMany({
            where: { id, userId },
        });
        return result.count === 1;
    }
}
export class FindProgressPostgres implements FindProgressPort {
    async findByUser(id: string): Promise<BookUserProgresRepo[]> {
        return await prisma.bookProgress.findMany({
            where: {
                userId: id,
            }, include: {
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
                book: true
            }
        }) as unknown as BookUserProgresRepo[];
    }

    async findById(
        id: string,
        userId: string
    ): Promise<BookUserProgresRepo | null> {
        return await prisma.bookProgress.findFirst({
            where: { id, userId },
            include: {
                book: true
            }
        }) as unknown as BookUserProgresRepo | null;
    }
}
