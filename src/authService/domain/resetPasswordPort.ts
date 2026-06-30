import { UserType } from "../../userService/domain/entities/UserTypes";


export interface ResetPasswordPort {
    resertPassword(token: string, password: string): Promise<UserType | ResetPasswordResponse>
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
    user?: UserType;
}