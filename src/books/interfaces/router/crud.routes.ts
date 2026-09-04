import { Router } from "express";
import { BooksCrudController } from "../controller/booksCrudController";
import { bookUpload, validateUploadSignatures } from "../../../shared/middlewares/secureUpload";
import { parseFormData } from "../../../shared/utils/parseFormData";
import { validatorBooks } from "../../../shared/middlewares/validatorBooks";
import { bookSchema } from "../../../shared/validations/book.validations";
import { validateJWT } from "../../../shared/middlewares/validateJWT";
import { validarRol } from "../../../shared/middlewares/validateRol";

const crudRouter = Router();
const controller = new BooksCrudController();

crudRouter.post(
     "/saveBook",
     validateJWT, validarRol("ADMIN"),
     bookUpload(), validateUploadSignatures,
     parseFormData,
     validatorBooks(bookSchema),
     (req, res, next) => { void controller.createBook(req, res, next) }
);

crudRouter.patch(
     "/updateBook/:id",
     validateJWT, validarRol("ADMIN"),

     bookUpload(), validateUploadSignatures,
     parseFormData,
     (req, res, next) => { void controller.updateBookById(req, res, next) }
);

crudRouter.delete(
     "/:id",
     validateJWT, validarRol("ADMIN"),

     (req, res, next) => { void controller.deleteBook(req, res, next) }


);

crudRouter.get("/", validateJWT, (req, res, next) => { void controller.getAllBook(req, res, next) }
);

crudRouter.get("/:id", (req, res, next) => { void controller.getBookById(req, res, next) }
);


export default crudRouter;
