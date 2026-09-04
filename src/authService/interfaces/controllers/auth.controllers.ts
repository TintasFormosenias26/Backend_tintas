import { NextFunction, Request, Response } from "express";


declare global {
    namespace Express {
        interface Request {
            user?: { id: string; rol: string; iat?: number; exp?: number };
        }

    }

}
import { generarJWT } from "../../helpers/generJWT";
import { AuthUserRepository } from "../../../userService/domain/ports/AuthUserRepository";
import { Auth_users } from "../../application/service/Auth.Service";
import { AuthPostgres } from "../../../userService/infrastructure/userRespositoryMongo";

const authUserRepositoryMongo: AuthUserRepository = new AuthPostgres()
const authUserService = new Auth_users(authUserRepositoryMongo)

import { AUTH_COOKIE_NAME, authCookieOptions } from "../../../shared/config/authCookie";
import type { Response as ExpressResponse } from "express";
import { sendError } from "../../../shared/middlewares/errorHandler";

export function completeLogin(res: ExpressResponse, token: string) {
    res.cookie(AUTH_COOKIE_NAME, token, authCookieOptions());
    return res.status(200).json({ success: true, message: "Sesión iniciada correctamente." });
}



export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    try {
        const result = await authUserService.login(email, password)

        if (!result) {
            sendError(res, 401, "INVALID_CREDENTIALS", "El correo o la contraseña son incorrectos.");
        } else {
            const id = result.id

            const token = await generarJWT(id, result.rol);
            completeLogin(res, token);
        }
    } catch (error) {
        next(error);
    }
}

//get user 
export const getMeCtrl = (req: Request, res: Response): void => {
    res.status(200).json({ success: true, user_data: req.user });
}

//logout
export const logout = async (req: Request, res: Response) => {
    res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());
    return res.json({ success: true, message: "Sesión cerrada correctamente." });
}
