import { PublicUser, UpdateUserDTO } from "../entities/UserTypes";
import { api_response } from "../../../shared/types/reponse.types";
import { Role } from "../../../prisma/generated/enums";

export interface UpdateUSerRepository {
    updateUSer(
        id: string,
        user: UpdateUserDTO
    ): Promise<PublicUser | null | api_response>;
}
export interface UpdateRolRepo {
    updateRol(
        id: String,
        rol: Role
    ): Promise<PublicUser | null | api_response>
}
