import { UpdateRolRepo, UpdateUSerRepository } from "../../domain/ports/UpdateUserRepository";
import { PublicUser, UpdateUserDTO } from "../../domain/entities/UserTypes";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { UniqueUserName } from "../../domain/ports/UniqueUserName";
import { api_response } from "../../../shared/types/reponse.types";
import { Role } from "../../../prisma/generated/enums";


export class UpdateUSer implements UpdateUSerRepository {
    constructor(
        private readonly userRepo: UpdateUSerRepository,
        private readonly authRepo: AuthUserRepository,
        private readonly uniqueRepo: UniqueUserName,
    ) { }
    async updateUSer(id: string, user: UpdateUserDTO): Promise<PublicUser | null | api_response> {
        if (user.email) {
            const emailExists = await this.authRepo.findByEmail(user.email);
            if (emailExists && emailExists.id !== id) {
                return {
                    success: false,
                    message: "Email already in use",
                    status: 400
                };

            }

        }
        if (user.userName) {
            const usernameExists = await this.uniqueRepo.findByUserName(user.userName);
            if (usernameExists && usernameExists.id !== id) {
                return {
                    success: false,
                    message: "UserName already in use",
                    status: 400
                };
            }

        }
        return await this.userRepo.updateUSer(id, user);
    }
}
export class UpdaRolService implements UpdateRolRepo {
    constructor(
        private readonly userRepo: UpdateRolRepo,
    ) { }
    async updateRol(id: String, rol: Role): Promise<PublicUser | null | api_response> {

        return await this.userRepo.updateRol(id, rol)
    }
} 
