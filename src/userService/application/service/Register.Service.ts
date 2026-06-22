import { UserType } from "../../domain/entities/UserTypes";
import { IRegisterRepository } from "../../domain/ports/RegisterRepositoryPorts";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { UniqueUserName } from "../../domain/ports/UniqueUserName";
import * as bcrypt from 'bcrypt-ts';
import { calcularEdad } from "../../../shared/utils/calcularNivel";
import { getAllAvatars } from "../../infrastructure/Apis/avatarApi";
import { avatarsAssignment } from "../../domain/utils/avatarAssignment";
import { api_response } from "../../../shared/types/reponse.types";

export class Register implements IRegisterRepository {
    constructor(
        private readonly userRepo: IRegisterRepository,
        private readonly authRepo: AuthUserRepository,
        private readonly uniqueRepo: UniqueUserName
    ) { }
    async createUser(user: UserType): Promise<UserType | api_response> {
        const emailExists = await this.authRepo.findByEmail(user.email);
        if (emailExists) {
            return {
                success: false,
                message: "Email already in use",
                status: 400
            };
        }
        const usernameExists = await this.uniqueRepo.findByUserName(user.userName);
        if (usernameExists) {
            return {
                success: false,
                message: "Username already in use",
                status: 400
            };
        }

        const level = calcularEdad(user.birthDate);
        const hashedPassword = await bcrypt.hash(user.password, 10);


        const avatars = await getAllAvatars();
        const avatarAssignment = await avatarsAssignment(avatars);
        console.log(avatarAssignment)
        if (!avatarAssignment) {
            return {
                success: false,
                message: "Failed to assign avatar",
                status: 500
            };
        }

        const newUser = { ...user, level, avatar: avatarAssignment, password: hashedPassword };
        console.log(newUser);
        return await this.userRepo.createUser(newUser);
    }
}



