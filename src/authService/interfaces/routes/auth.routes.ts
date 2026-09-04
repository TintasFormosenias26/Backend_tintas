import { Router } from "express";
import { getMeCtrl, login, logout, } from "../controllers/auth.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { sendEmailController } from "../controllers/sendEmail.controller";
import { ResetPasswordController } from "../controllers/ResetPassword";
import { rateLimit } from "../../../shared/middlewares/rateLimit";
import ENV from "../../../shared/config/configEnv";

export const authRoutes = Router();

// authRoutes.post("/save_auth", postAuth);
authRoutes.post("/login", rateLimit({ name: "login", windowMs: ENV.RATE_LIMIT_WINDOW_MS, max: ENV.RATE_LIMIT_LOGIN_MAX, accountAware: true }), login);
authRoutes.get("/getUser", validateJWT, getMeCtrl)
authRoutes.post('/logout', logout)

//Reset password
authRoutes.post("/sendEmail", rateLimit({ name: "recovery-request", windowMs: ENV.RATE_LIMIT_WINDOW_MS, max: ENV.RATE_LIMIT_RECOVERY_MAX, accountAware: true }), sendEmailController)
authRoutes.post("/resetPassword", rateLimit({ name: "recovery-consume", windowMs: ENV.RATE_LIMIT_WINDOW_MS, max: ENV.RATE_LIMIT_RECOVERY_MAX }), ResetPasswordController)
