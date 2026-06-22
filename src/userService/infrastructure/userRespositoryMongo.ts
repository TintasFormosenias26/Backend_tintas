import { prisma } from "../../shared/lib/prisma";
import { api_response } from "../../shared/types/reponse.types";
import { UpdateUserDTO, UserType } from "../domain/entities/UserTypes";
import { AuthUserRepository } from "../domain/ports/AuthUserRepository";
import { FindAndDeleteRepo, FindByIdRepo } from "../domain/ports/FindAndDeleteRepo";
import { IRegisterRepository } from "../domain/ports/RegisterRepositoryPorts";
import { UniqueUserName } from "../domain/ports/UniqueUserName";
import { UpdateUSerRepository } from "../domain/ports/UpdateUserRepository";

export class UserPostgres implements IRegisterRepository {
  async createUser(user: UserType): Promise<UserType> {
    return await prisma.user.create({
      data: {
        name: user.name,
        lastName: user.lastName,
        userName: user.userName,
        birthDate: user.birthDate,
        email: user.email,
        level: user.level as any,
        password: user.password,
        avatar: user.avatar,
      },
    });
  }
}

export class AuthPostgres implements AuthUserRepository {
  async findByEmail(email: string): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: {
        email,
      },
    });
  }
}

export class UniqueUsernamePostgre implements UniqueUserName {
  async findByUserName(userName: string): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: {
        userName,
      },
    });
  }
}

export class UpdateUserPostgresRepository implements UpdateUSerRepository {
  updateUSer(id: string, user: UpdateUserDTO): Promise<UserType>
  async updateUSer(
    id: string,
    user: UpdateUserDTO
  ): Promise<UserType> {

    return await prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }
}
export class findAndDeleteMongo implements FindAndDeleteRepo {




  async deleteUser(id: string): Promise<boolean> {
    await prisma.user.delete({
      where: {
        id,
      },
    });
    return true;
  }
  async findUser() {
    return await prisma.user.findMany({

    });
  }
}
export class UserFindById implements FindByIdRepo {
  async findByID(id: any): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: {
        id,
      },
    });
  }
}