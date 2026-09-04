import { NextFunction, Request, Response } from "express";
import { AuthPostgres, UniqueUsernamePostgre, UserPostgres } from "../../infrastructure/userRespositoryMongo";
import { UserType } from "../../domain/entities/UserTypes";
import { IRegisterRepository } from "../../domain/ports/RegisterRepositoryPorts";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { Register } from "../../application/service/Register.Service";

// initialize the user service
const userRespositoryMongo: IRegisterRepository = new UserPostgres();
const authRepositoryMongo: AuthUserRepository = new AuthPostgres();
const uniqueUsername = new UniqueUsernamePostgre();
const userService: IRegisterRepository = new Register(userRespositoryMongo, authRepositoryMongo, uniqueUsername);

//register
export const registers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user: UserType = req.body;
    const newUser = { ...user };

    const result = await userService.createUser(newUser);

    if ('success' in result && !result.success) {
      res.status(result.status).json(result);
      return;
    }

    res.status(201).json({ success: true, message: "Usuario creado correctamente.", result });
  } catch (error) {
    next(error);
  }
};
