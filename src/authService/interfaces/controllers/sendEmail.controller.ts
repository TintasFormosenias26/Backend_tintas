import { Request, Response } from "express";
import { sendEmail } from "../../application/service/SendEmail.Service";





export const sendEmailController = async (req: Request, res: Response) => {
    try {
        console.log(req.body)
        const { email } = req.body
        console.log(email)

        // Validación básica
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "El email es requerido",
            });
        }

        const result = await sendEmail(email);
        console.log(result)
        if (result === null) {
            return res.status(400).json({ msg: 'the email is not found' });
        }

        return res.status(200).json({
            success: true,
            message: "Si el email existe, recibirás un código de recuperación",
        });

    } catch (error) {
        console.error("Error en requestPasswordReset:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};


