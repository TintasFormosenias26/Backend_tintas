import { UserType } from "../entities/UserTypes";

export interface UniqueUserName {
    findByUserName(userName: string): Promise<UserType | null>;
}
