import { UpdateUserDTO, UserType } from "../entities/UserTypes";
import { api_response } from "../../../shared/types/reponse.types";

export interface UpdateUSerRepository {
    updateUSer(
        id: string,
        user: UpdateUserDTO
    ): Promise<UserType | null | api_response>;
}