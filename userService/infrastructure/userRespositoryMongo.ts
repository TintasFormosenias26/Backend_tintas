import { prisma } from "../../shared/lib/prisma";
import { api_response } from "../../shared/types/reponse.types";
import { UpdateUserDTO, UserType } from "../domain/entities/UserTypes";
import { AuthUserRepository } from "../domain/ports/AuthUserRepository";
import { FindAndDeleteRepo } from "../domain/ports/FindAndDeleteRepo";
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
        password: user.password,
        nivel: user.nivel,
        imgLevel: user.imgLevel,
        rol: user.rol,
        point: user.point,
        avatarId: user.avatarId,
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
  updateUSer(id: string, user: UpdateUserDTO): Promise<UserType | null | api_response> {
    throw new Error("Method not implemented.");
  }
  async updateUser(
    id: string,
    user: UpdateUserDTO
  ): Promise<UserType | null> {

    return await prisma.user.update({
      where: {
        id,
      },
      data: user,
    });
  }
}
export class findAndDeleteMongo implements FindAndDeleteRepo {

  async findByID(id: string) {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        avatar: true,
        preference: true,
        progresses: true,
      },
    });
  }


  async deleteUser(id: string): Promise<void> {
    await prisma.user.delete({
      where: {
        id,
      },
    });
  }
  async findUser() {
    return await prisma.user.findMany({
      include: {
        avatar: true,
      },
    });
  }
}
