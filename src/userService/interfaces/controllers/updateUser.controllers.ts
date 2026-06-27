import { Request, Response } from "express";
import { AuthPostgres, findAndDeleteMongo, UniqueUsernamePostgre, UpdateRoleRepository, UpdateUserPostgresRepository, UserFindById } from "../../infrastructure/userRespositoryMongo";
import { UserType } from "../../domain/entities/UserTypes";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { UpdaRolService, UpdateUSer } from "../../application/service/UpdateUser.Service";
import { UpdateRolRepo, UpdateUSerRepository } from "../../domain/ports/UpdateUserRepository";
interface UserRequestParams {
  id: string;
}

// initialize the user service
const userRespositoryMongo: UpdateUSerRepository = new UpdateUserPostgresRepository();
const authRepositoryMongo: AuthUserRepository = new AuthPostgres();
const uniqueUsername = new UniqueUsernamePostgre();
const findUser = new UserFindById()

const updateUserService: UpdateUSerRepository = new UpdateUSer(userRespositoryMongo, authRepositoryMongo, uniqueUsername, findUser);
const updateRoleRepository = new UpdateRoleRepository()
const updateRol: UpdateRolRepo = new UpdaRolService(updateRoleRepository)

export const findAndUpdate = async (
  req: Request,
  res: Response
) => {
  try {
    const newUser: UserType = req.body;
    const id = req.user?.id;

    if (!id) {
      return res.status(400).json({
        message: "No user ID found"
      });
    }

    const result = await updateUserService.updateUSer(
      id,
      newUser
    );

    if (!result) {
      return res.status(404).json({
        msg: "the user not update"
      });
    }

    if ("success" in result && !result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      msg: "user update successful",
      data: result
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "internal server error",
      error
    });
  }
};
export const updateRolController = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return res.status(400).json({
        message: "No user ID found"
      });
    }

    const { rol } = req.body;
    const result = await updateRol.updateRol(id, rol);

    if (!result) {
      return res.status(404).json({
        msg: "the role not update"
      });
    }

    if ("success" in result && !result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      msg: "role update successful",
      data: result
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "internal server error",
      error
    });
  }
}