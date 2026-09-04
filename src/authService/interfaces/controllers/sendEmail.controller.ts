import { Request, Response } from "express";
import { sendEmail } from "../../application/service/SendEmail.Service";





export const sendEmailController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body

        // Validación básica
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "El email es requerido",
            });
        }

        await sendEmail(email);

        // La respuesta es deliberadamente idéntica exista o no la cuenta.
        return res.status(200).json({
            success: true,
            message: "Si el email existe, recibirás un código de recuperación",
        });

    } catch {
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
        });
    }
};


