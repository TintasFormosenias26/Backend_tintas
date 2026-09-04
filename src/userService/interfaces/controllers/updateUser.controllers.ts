import { NextFunction, Request, Response } from "express";
import { AuthPostgres, UniqueUsernamePostgre, UpdateRoleRepository, UpdateUserPostgresRepository } from "../../infrastructure/userRespositoryMongo";
import { UserUpdateZodSchema } from "../../application/validations/userZodSchema";
import { AuthUserRepository } from "../../domain/ports/AuthUserRepository";
import { UpdaRolService, UpdateUSer } from "../../application/service/UpdateUser.Service";
import { UpdateRolRepo, UpdateUSerRepository } from "../../domain/ports/UpdateUserRepository";
import { sendError } from "../../../shared/middlewares/errorHandler";
import { z } from "zod";

// initialize the user service
const userRespositoryMongo: UpdateUSerRepository = new UpdateUserPostgresRepository();
const authRepositoryMongo: AuthUserRepository = new AuthPostgres();
const uniqueUsername = new UniqueUsernamePostgre();

const updateUserService: UpdateUSerRepository = new UpdateUSer(userRespositoryMongo, authRepositoryMongo, uniqueUsername);
const updateRoleRepository = new UpdateRoleRepository()
const updateRol: UpdateRolRepo = new UpdaRolService(updateRoleRepository)

export const findAndUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = UserUpdateZodSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 422, "INVALID_USER_UPDATE", "Los datos enviados no son válidos.", {
        fields: parsed.error.issues.map(({ path, message }) => ({ path: path.join("."), message })),
      });
    }

    // DTO por allowlist: nunca se reenvía req.body al caso de uso ni a Prisma.
    const newUser = {
      name: parsed.data.name,
      lastName: parsed.data.lastName,
      userName: parsed.data.userName,
      birthDate: parsed.data.birthDate,
      email: parsed.data.email,
      avatar: parsed.data.avatar,
    };
    const id = req.user?.id;

    if (!id) {
      return sendError(res, 401, "UNAUTHORIZED", "Tu sesión no es válida.");
    }

    const result = await updateUserService.updateUSer(
      id,
      newUser
    );

    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "No se encontró el usuario.");
    }

    if ("success" in result && !result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado correctamente.",
      data: result
    });

  } catch (error) {
    return next(error);
  }
};

export const updateUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    const parsed = UserUpdateZodSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 422, "INVALID_USER_UPDATE", "Los datos enviados no son válidos.", {
      fields: parsed.error.issues.map(({ path, message }) => ({ path: path.join("."), message })),
    });

    if (!id) {
      return sendError(res, 400, "INVALID_USER_ID", "El identificador de usuario no es válido.");
    }

    const result = await updateUserService.updateUSer(id, parsed.data);
    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "No se encontró el usuario.");
    }
    if ("success" in result && !result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({ success: true, message: "Usuario actualizado correctamente.", data: result });
  } catch (error) {
    return next(error);
  }
};

//UPDATE ROL OF USER 
export const updateRolController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      return sendError(res, 400, "INVALID_USER_ID", "El identificador de usuario no es válido.");
    }

    const parsedRole = z.object({ rol: z.enum(["USER", "ADMIN", "SUPERADMIN"]) }).strict().safeParse(req.body);
    if (!parsedRole.success) return sendError(res, 422, "INVALID_ROLE", "El rol indicado no es válido.");
    const { rol } = parsedRole.data;
    const result = await updateRol.updateRol(id, rol);

    if (!result) {
      return sendError(res, 404, "USER_NOT_FOUND", "No se encontró el usuario.");
    }

    if ("success" in result && !result.success) {
      return res.status(result.status).json(result);
    }

    return res.status(200).json({
      success: true,
      message: "Rol actualizado correctamente.",
      data: result
    });
  } catch (error) {
    return next(error);
  }
}
