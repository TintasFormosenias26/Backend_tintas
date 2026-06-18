import { UserType } from "../entities/UserTypes";

export interface FindAndDeleteRepo {
    deleteUser(id: any): Promise<void>
    findUser(): Promise<UserType[]>
    findByID(id: any): Promise<UserType | null>
}