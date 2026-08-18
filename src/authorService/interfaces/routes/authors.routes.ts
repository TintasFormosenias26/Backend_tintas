import { Router } from "express";
import { createAuthor } from "../controllers/saveAuthor.controllers";
import { validarRol } from "../../../shared/middlewares/validateRol";
import { getAllAuthores, getAuthorById, getAuthorByName } from "../controllers/findAuthor.controllers";
import { deleteAuthorById } from "../controllers/deleteAuthor.controllers";
import { updateAuthors } from "../controllers/updateAuthor.controllers";
import multer from "multer";
import { validateJWT } from "../../../shared/middlewares/validateJWT";

export const autorRoutes = Router();
const upload = multer({ dest: "uploads/" });

autorRoutes.post(
  "/authors/create",
  validateJWT, validarRol("ADMIN"),
  upload.single("avatar"),
  createAuthor
);
autorRoutes.get("/name/", getAuthorByName);
autorRoutes.get("/AllAuthores", getAllAuthores);
autorRoutes.get("/:id", getAuthorById);
autorRoutes.delete("/:id", validateJWT, validarRol("ADMIN"),
  deleteAuthorById);
autorRoutes.put("/:id", validateJWT, validarRol("ADMIN"),
  upload.single("photo"), updateAuthors);

