import { Request, Response } from "express";
import { AuthPostgres, findAndDeleteMongo, UniqueUsernamePostgre, UpdateUserPostgresRepository } from "../../infrastructure/userRespositoryMongo";
import { UserType } from "../../domain/entities/UserTypes";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { UpdateUSer } from "../../application/service/UpdateUser.Service";
import { UpdateUSerRepository } from "../../domain/ports/UpdateUserRepository";
interface UserRequestParams {
  id: string;
}

// initialize the user service
const userRespositoryMongo: UpdateUSerRepository = new UpdateUserPostgresRepository();
const authRepositoryMongo: AuthUserRepository = new AuthPostgres();
const uniqueUsername = new UniqueUsernamePostgre();
const findUser = new findAndDeleteMongo()

const updateUserService: UpdateUSerRepository = new UpdateUSer(userRespositoryMongo, authRepositoryMongo, uniqueUsername, findUser);

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