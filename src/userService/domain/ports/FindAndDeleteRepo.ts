import { int32 } from "zod";
import { UserType } from "../entities/UserTypes";

export type PublicUser = Omit<UserType, "password">;

export interface FindAndDeleteRepo {
    deleteUser(id: any): Promise<boolean>
    findUser(): Promise<PublicUser[]>
}
export interface FindByIdRepo {
    findByID(id: any): Promise<UserType | null>
}
export interface FindByEmailRepo {
    findByEmail(email: string): Promise<UserType | null>
}
