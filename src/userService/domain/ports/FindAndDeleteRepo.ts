import { PublicUser, UserType } from "../entities/UserTypes";

export interface FindAndDeleteRepo {
    deleteUser(id: any): Promise<boolean>
    findUser(): Promise<PublicUser[]>
}
export interface FindByIdRepo {
    findByID(id: string): Promise<PublicUser | null>
}
export interface FindByEmailRepo {
    findByEmail(email: string): Promise<UserType | null>
}
