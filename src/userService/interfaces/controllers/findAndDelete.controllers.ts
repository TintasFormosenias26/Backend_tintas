import { NextFunction, Request, Response } from "express";
import { FindAndDeleteUser, FindByID } from "../../application/service/FindAndDelete.service";
import { FindAndDeleteRepo, FindByIdRepo } from "../../domain/ports/FindAndDeleteRepo";
import { findAndDeleteMongo, UserFindById } from "../../infrastructure/userRespositoryMongo";
import { sendError } from "../../../shared/middlewares/errorHandler";

const findAndDeleteUser: FindAndDeleteRepo = new findAndDeleteMongo();
const findAndDelService: FindAndDeleteUser = new FindAndDeleteUser(findAndDeleteUser);
const findUserByIdPrisma: FindByIdRepo = new UserFindById()
const findUserService: FindByID = new FindByID(findUserByIdPrisma)



export const findUser = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await findAndDelService.findUser();
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.user?.id;
  try {
    if (!id) return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
    const result = await findAndDelService.deleteUser(id)
    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "No se encontró el usuario.");
    }
    return res.status(200).json({ success: true, message: "Usuario eliminado correctamente." });
  } catch (error) {
    return next(error);
  }


};

export const deleteUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) return sendError(res, 400, "INVALID_USER_ID", "El identificador de usuario no es válido.");
    if (id === req.user?.id) {
      return sendError(res, 409, "SELF_DELETE_NOT_ALLOWED", "No podés eliminar tu propia cuenta desde el panel.");
    }

    await findAndDelService.deleteUser(id);
    return res.status(200).json({ success: true, message: "Usuario eliminado correctamente." });
  } catch (error) {
    return next(error);
  }
};
export const findById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.user?.id;
    if (!id) return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");

    const result = await findUserService.findByID(id);
    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "No se encontró el usuario.");
    }
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return next(error);
  }
};

