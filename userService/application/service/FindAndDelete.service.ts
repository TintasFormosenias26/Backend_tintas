import { UserType } from "../../domain/entities/UserTypes";
import { FindAndDeleteRepo } from "../../domain/ports/FindAndDeleteRepo";



export class FindAndDeleteUser implements FindAndDeleteRepo {
    constructor(private readonly userRepo: FindAndDeleteRepo) { }

    async findUser(): Promise<UserType[]> {
        const users = await this.userRepo.findUser();
        return users
    }
    async findByID(id: any): Promise<UserType | null> {
        const result = await this.userRepo.findByID(id);
        return result
    }
    async deleteUser(id: any): Promise<boolean> {
        const result = await this.userRepo.deleteUser(id)
        return result
    }
}