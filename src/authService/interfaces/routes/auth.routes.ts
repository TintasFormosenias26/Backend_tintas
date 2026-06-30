import { Request, Response, Router } from "express";
import { getMeCtrl, login, logout, } from "../controllers/auth.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { sendEmailController } from "../controllers/sendEmail.controller";
import { ResetPasswordController } from "../controllers/ResetPassword";

export const authRoutes = Router();

// authRoutes.post("/save_auth", postAuth);
authRoutes.post("/login", login);
authRoutes.get("/getUser", validateJWT, getMeCtrl)
authRoutes.post('/logout', logout)

//Reset password
authRoutes.post("/sendEmail", sendEmailController)
authRoutes.post("/resetPassword", ResetPasswordController)
