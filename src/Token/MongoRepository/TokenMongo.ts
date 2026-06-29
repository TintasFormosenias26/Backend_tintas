import { createToken } from "../repository/createToken";
import { deleteToken } from "../repository/DeleteToken";
import { findToken } from "../repository/findToke";
import { Itoken } from "../types/Token.type";
import { programarEliminacionDeToken } from "../utils/DeleteToken";
import { generateCustomToken } from "../utils/GenerarToken";
import { prisma } from "../../shared/lib/prisma";


export class CreateTokenPrisma implements createToken {
    async createToken(email: string) {
        const tokenValue = generateCustomToken();

        const result = await prisma.token.create({
            data: {
                token: tokenValue,
                userEmail: email,
            },
        });

        programarEliminacionDeToken(result.token);

        return result;
    }
}
export class FindTokenPrisma implements findToken {
    async findToken(token: string): Promise<Itoken | null> {
        const result = await prisma.token.findUnique({
            where: { token },
        });

        return result ?? null;
    }
}

export class DeleteTokenPrisma implements deleteToken {
    async deleteTokens(token: string): Promise<void> {
        await prisma.token.delete({
            where: { token },
        });
    }
}

