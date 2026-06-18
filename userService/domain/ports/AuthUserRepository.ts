import { UserType } from "../entities/UserTypes";

export interface AuthUserRepository {
    findByEmail(email: string): Promise<UserType | null>;
}
