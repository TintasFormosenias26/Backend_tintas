import { Request, Response } from "express";
import { UpdateUSerRepository } from "../../../userService/domain/ports/UpdateUserRepository";
import { UpdateUserPostgresRepository, UserFindByEmail } from "../../../userService/infrastructure/userRespositoryMongo";
import { ResetPassword } from "../../application/service/ResetPassword.Service";




const userRespositoryMongo = new UpdateUserPostgresRepository();
const findByEmail = new UserFindByEmail()

const resetPassword = new ResetPassword(findByEmail, userRespositoryMongo)

const ResetPasswordController = async (req: Request, res: Response) => {
    try {
        const { token, password } = req.body;

        const result = resetPassword.resertPassword(token, password)

        if (!result) {
            res.status(301).json({ msg: "incorrect token" })
        }
        return res.status(200).json({ msg: 'password update success' })
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "internal server error",
            error
        });
    }
}