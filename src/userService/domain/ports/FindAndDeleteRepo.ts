import { int32 } from "zod";
import { UserType } from "../entities/UserTypes";

export interface FindAndDeleteRepo {
    deleteUser(id: any): Promise<boolean>
    findUser(): Promise<UserType[]>
}
export interface FindByIdRepo {
    findByID(id: any): Promise<UserType | null>
}