import { UserType } from "../../userService/domain/entities/UserTypes";


export interface ResetPasswordPort {
    resertPassword(token: string, password: string): Promise<UserType | null>
}

