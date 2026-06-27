import { api_response } from "../../../shared/types/reponse.types";
import { UserType } from "../entities/UserTypes";

// funciones del usuario
export interface IRegisterRepository {
    createUser(user: UserType): Promise<UserType | api_response>;


}




