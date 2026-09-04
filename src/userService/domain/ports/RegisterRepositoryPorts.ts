import { api_response } from "../../../shared/types/reponse.types";
import { PublicUser, UserType } from "../entities/UserTypes";

// funciones del usuario
export interface IRegisterRepository {
    createUser(user: UserType): Promise<PublicUser | api_response>;


}




