import { UserType } from "../../domain/entities/UserTypes";
import { FindAndDeleteRepo, FindByIdRepo, PublicUser } from "../../domain/ports/FindAndDeleteRepo";



export class FindAndDeleteUser implements FindAndDeleteRepo {
    constructor(private readonly userRepo: FindAndDeleteRepo) { }

    async findUser(): Promise<PublicUser[]> {
        const users = await this.userRepo.findUser();
        return users
    }

    async deleteUser(id: any): Promise<boolean> {
        const result = await this.userRepo.deleteUser(id)
        return result
    }
}
export class FindByID implements FindByIdRepo {
    constructor(private readonly findUserRepo: FindByIdRepo) { }

    async findByID(id: any): Promise<UserType | null> {
        const result = await this.findUserRepo.findByID(id);
        return result
    }
}
