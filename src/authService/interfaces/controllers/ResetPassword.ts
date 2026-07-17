import { Request, Response } from "express";
import { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import { UpdateUserPostgresRepository, UserFindByEmail } from "../../../userService/infrastructure/userRespositoryMongo";
import { ResetPassword } from "../../application/service/ResetPassword.Service";




const userRespositoryMongo = new UpdateUserPostgresRepository();
const findByEmail = new UserFindByEmail()

const resetPassword = new ResetPassword(findByEmail, userRespositoryMongo)

export const ResetPasswordController = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        const result = await resetPassword.resertPassword(token, password)

        if (!result) {
            return res.status(400).json({ msg: "Token inválido o vencido" })
        }
        return res.status(200).json({ msg: 'password update success' })
    } catch (error) {
        console.error("Error al restablecer contraseña", error);

        return res.status(500).json({
            message: "internal server error"
        });
    }
}
