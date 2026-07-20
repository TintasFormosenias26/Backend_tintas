import { Router } from "express";
import { registers } from "../controllers/register.controllers";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { findAndUpdate, updateRolController, updateUserById } from "../controllers/updateUser.controllers";
import { deleteUser, deleteUserById, findById, findUser } from "../controllers/findAndDelete.controllers";
import { UserValidation } from "../../application/validations/userValidation";
import { validarRol } from "../../../shared/middlewares/validateRol";

export const userRoutes = Router();

userRoutes.post("/register", UserValidation, registers);
userRoutes.put("/updateUser", validateJWT, findAndUpdate);
userRoutes.get("/", validateJWT, validarRol("SUPERADMIN"), findUser);
userRoutes.get("/me", validateJWT, findById);
userRoutes.delete("/delete", validateJWT, deleteUser);
userRoutes.put("/updateRol/:id", validateJWT, validarRol("SUPERADMIN"), updateRolController);
userRoutes.put("/:id", validateJWT, validarRol("SUPERADMIN"), updateUserById);
userRoutes.delete("/:id", validateJWT, validarRol("SUPERADMIN"), deleteUserById);
