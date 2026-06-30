import { FindTokenPrisma } from "../../../Token/MongoRepository/TokenMongo";
import { UserType } from "../../../userService/domain/entities/UserTypes";
import { FindByEmailRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";
import { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import { ResetPasswordPort, ResetPasswordResponse } from "../../domain/resetPasswordPort";
import bcrypt from 'bcrypt';

export class ResetPassword implements ResetPasswordPort {
    constructor(
        private readonly findEmail: FindByEmailRepo,
        private readonly update: UpdateUSerRepository
    ) { }

    async resertPassword(
        token: string,
        oldPasword: string
    ): Promise<ResetPasswordResponse> {

        const findTokenMongo = new FindTokenPrisma();

        const result = await findTokenMongo.findToken(token);

        if (!result) {
            return {
                success: false,
                message: "El token es inválido o ha expirado."
            };
        }

        if (!result.userEmail) {
            return {
                success: false,
                message: "El token no está asociado a ningún usuario."
            };
        }

        const user = await this.findEmail.findByEmail(result.userEmail);

        if (!user) {
            return {
                success: false,
                message: "No se encontró un usuario asociado al token."
            };
        }
        const password = await bcrypt.hash(oldPasword, 10);
        const updatedUser = await this.update.updateUSer(user.id, {
            password,
        });

        if (!updatedUser || !("id" in updatedUser)) {
            return {
                success: false,
                message: "No fue posible actualizar la contraseña."
            };
        }

        return {
            success: true,
            message: "La contraseña se actualizó correctamente.",
            user: updatedUser
        };
    }
}