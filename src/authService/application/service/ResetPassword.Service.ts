import { FindTokenPrisma } from "../../../Token/MongoRepository/TokenMongo";
import { UserType } from "../../../userService/domain/entities/UserTypes";
import { FindByEmailRepo } from "../../../userService/domain/ports/FindAndDeleteRepo";
import { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import { ResetPasswordPort } from "../../domain/resetPasswordPort";


export class ResetPassword implements ResetPasswordPort {
    constructor(
        private readonly findEmail: FindByEmailRepo,
        private readonly update: UpdateUSerRepository
    ) { }
    async resertPassword(token: string, password: string): Promise<UserType | null> {
        const findTokenMongo = new FindTokenPrisma();
        const result = await findTokenMongo.findToken(token);
        if (!result) {
            return null;
        }

        if (result.userEmail) {
            const user = await this.findEmail.findByEmail(result.userEmail);
            if (!user) {
                return null
            }
            const updatedUser = await this.update.updateUSer(user.id, { password })
            if (updatedUser && "id" in updatedUser) {
                return updatedUser
            }
            return null
        }

        return null
    }

}