import bcrypt from "bcrypt";
import { PrismaResetTokenStore, type ResetTokenStore } from "../../../Token/MongoRepository/TokenMongo";
import type { FindByEmailRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";
import type { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import type { ResetPasswordPort, ResetPasswordResponse } from "../../domain/resetPasswordPort";

export class ResetPassword implements ResetPasswordPort {
  constructor(
    private readonly findEmail: FindByEmailRepo,
    private readonly update: UpdateUSerRepository,
    private readonly tokens: ResetTokenStore = new PrismaResetTokenStore(),
  ) {}

  async resertPassword(token: string, newPassword: string): Promise<ResetPasswordResponse> {
    const email = await this.tokens.consumeToken(token);
    if (!email) return { success: false, message: "El token es inválido o ha expirado." };
    const user = await this.findEmail.findByEmail(email);
    if (!user) return { success: false, message: "El token es inválido o ha expirado." };

    const password = await bcrypt.hash(newPassword, 12);
    const updated = await this.update.updateUSer(user.id, { password });
    return updated && "id" in updated
      ? { success: true, message: "La contraseña se actualizó correctamente." }
      : { success: false, message: "No fue posible actualizar la contraseña." };
  }
}
