import { UpdateUserDTO, UserType } from "../entities/UserTypes";
import { api_response } from "../../../shared/types/reponse.types";
import { Role } from "../../../prisma/generated/enums";
import { promises } from "node:dns";

export interface UpdateUSerRepository {
    updateUSer(
        id: string,
        user: UpdateUserDTO
    ): Promise<UserType | null | api_response>;
}
export interface UpdateRolRepo {
    updateRol(
        id: String,
        rol: Role
    ): Promise<UserType | null | api_response>
}