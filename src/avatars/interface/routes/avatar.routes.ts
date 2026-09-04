import { Router } from "express";
import { deleteAvatar, getAvatars, saveAvatar, updateAvatar } from "../controllers/avatar.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { validarRol } from "../../../shared/middlewares/validateRol";
import { imageUpload, validateUploadSignatures } from "../../../shared/middlewares/secureUpload";



export const avaRoutes = Router()



avaRoutes.post("/saveAvatar", validateJWT, validarRol("ADMIN"), imageUpload("avatars"), validateUploadSignatures, saveAvatar)
avaRoutes.delete("/deleteAvatar/:id", validateJWT, validarRol("ADMIN"), deleteAvatar)
avaRoutes.get("/getAvatars", getAvatars)
avaRoutes.put("/updateAvatar/:id", validateJWT, validarRol("ADMIN"), imageUpload("avatars"), validateUploadSignatures, updateAvatar)
