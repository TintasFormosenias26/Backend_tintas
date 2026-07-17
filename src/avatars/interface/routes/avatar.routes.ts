import { Router } from "express";
import multer from "multer";
import { deleteAvatar, getAvatars, saveAvatar, updateAvatar } from "../controllers/avatar.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { validarRol } from "../../../shared/middlewares/validateRol";



export const avaRoutes = Router()

const upload = multer({ dest: "uploads/" });


avaRoutes.post("/saveAvatar", validateJWT, validarRol("ADMIN"), upload.single("avatars"), saveAvatar)
avaRoutes.delete("/deleteAvatar/:id", validateJWT, validarRol("ADMIN"), deleteAvatar)
avaRoutes.get("/getAvatars", getAvatars)
avaRoutes.put("/updateAvatar/:id", validateJWT, validarRol("ADMIN"), upload.single("avatars"), updateAvatar)