import { prisma } from "../../shared/lib/prisma";
import ENV from "../../shared/config/configEnv";
import { generateResetToken, hashResetToken } from "../utils/GenerarToken";

export interface ResetTokenStore {
  createToken(email: string): Promise<string>;
  consumeToken(token: string): Promise<string | null>;
}

export class PrismaResetTokenStore implements ResetTokenStore {
  async createToken(email: string): Promise<string> {
    const token = generateResetToken();
    const tokenHash = hashResetToken(token);
    const expiresAt = new Date(Date.now() + ENV.RESET_TOKEN_TTL_SECONDS * 1000);
    await prisma.$transaction([
      prisma.token.deleteMany({ where: { userEmail: email } }),
      prisma.token.create({ data: { tokenHash, userEmail: email, expiresAt } }),
    ]);
    return token;
  }

  async consumeToken(token: string): Promise<string | null> {
    if (!token || token.length > 512) return null;
    const tokenHash = hashResetToken(token);
    return prisma.$transaction(async (transaction) => {
      const record = await transaction.token.findUnique({
        where: { tokenHash },
        select: { id: true, userEmail: true, expiresAt: true, usedAt: true },
      });
      if (!record || record.usedAt || record.expiresAt <= new Date()) return null;
      const consumed = await transaction.token.updateMany({
        where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() },
      });
      return consumed.count === 1 ? record.userEmail : null;
    });
  }
}
