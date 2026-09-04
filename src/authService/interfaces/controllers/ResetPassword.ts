import { NextFunction, Request, Response } from "express";
import { UpdateUserPostgresRepository, UserFindByEmail } from "../../../userService/infrastructure/userRespositoryMongo";
import { ResetPassword } from "../../application/service/ResetPassword.Service";
import { z } from "zod";
import { sendError } from "../../../shared/middlewares/errorHandler";




const userRespositoryMongo = new UpdateUserPostgresRepository();
const findByEmail = new UserFindByEmail()

const resetPassword = new ResetPassword(findByEmail, userRespositoryMongo)

export const ResetPasswordController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = z.object({
            token: z.string().min(20).max(512),
            password: z.string().min(8).max(128).regex(/[A-Za-z]/).regex(/[0-9]/),
        }).strict().safeParse(req.body);
        if (!parsed.success) return sendError(res, 422, "INVALID_RESET_REQUEST", "Revisá la contraseña ingresada.");
        const { token, password } = parsed.data;

        const result = await resetPassword.resertPassword(token, password)

        if (!result.success) {
            return sendError(res, 400, "INVALID_RESET_TOKEN", "El enlace es inválido o venció.");
        }
        return res.status(200).json({ success: true, message: "Contraseña actualizada correctamente." });
    } catch (error) {
        return next(error);
    }
}
