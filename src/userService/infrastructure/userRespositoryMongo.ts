import { Role } from "../../prisma/generated/enums";
import { prisma } from "../../shared/lib/prisma";
import { api_response } from "../../shared/types/reponse.types";
import { PublicUser, UpdateUserDTO, UserType } from "../domain/entities/UserTypes";
import { AuthUserRepository } from "../domain/ports/AuthUserRepository";
import { FindAndDeleteRepo, FindByEmailRepo, FindByIdRepo } from "../domain/ports/FindAndDeleteRepo";
import { IRegisterRepository } from "../domain/ports/RegisterRepositoryPorts";
import { UniqueUserName } from "../domain/ports/UniqueUserName";
import { UpdateRolRepo, UpdateUSerRepository } from "../domain/ports/UpdateUserRepository";
import { publicUserOmit, publicUserSelect } from "../domain/entities/publicUser";

export class UserPostgres implements IRegisterRepository {
  async createUser(user: UserType): Promise<PublicUser> {
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
      omit: publicUserOmit,
    });
  }
}
;

export class UpdateRoleRepository implements UpdateRolRepo {
  async updateRol(id: string, rol: Role): Promise<PublicUser | null | api_response> {
    return await prisma.user.update({
      where: {
        id: id,
      },
      omit: publicUserOmit,
      data: {
        rol,
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
  updateUSer(id: string, user: UpdateUserDTO): Promise<PublicUser>
  async updateUSer(
    id: string,
    user: UpdateUserDTO
  ): Promise<PublicUser> {

    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: user.name,
        lastName: user.lastName,
        userName: user.userName,
        birthDate: user.birthDate,
        email: user.email,
        avatar: user.avatar,
        password: user.password,
      },
      omit: publicUserOmit,
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
      select: publicUserSelect,
    });
  }
}
export class UserFindByEmail implements FindByEmailRepo {
  async findByEmail(email: string): Promise<UserType | null> {
    return await prisma.user.findUnique({
      where: {
        email: email
      }
    })
  }
}
export class UserFindById implements FindByIdRepo {
  async findByID(id: string): Promise<PublicUser | null> {
    return await prisma.user.findUnique({
      where: {
        id,
      },
      select: publicUserSelect,
    });
  }
}
