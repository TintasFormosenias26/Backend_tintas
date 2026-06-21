import { Request, Response } from "express";
import { UpdateAuthor } from "../../app/service/UpdateAuthor.service";
import { Author } from "../../domain/entidades/author.Types";
import { authorUpdateValidation } from "../../app/validations/authorValidations";
import { UploadAuthorService } from "../../../shared/services/upload_Author.Service";
import {
  FindAuthorPostgresRepo,
  UpdateAuthorPostgresRepo,
} from "../../infrastructure/authores.MongoRepo";

const updateAuthorRepo = new UpdateAuthorPostgresRepo();
const findAuthorRepo = new FindAuthorPostgresRepo();
const updataAuthor = new UpdateAuthor(
  updateAuthorRepo,
  findAuthorRepo
);

export const updataAuthors = async (
  req: Request,
  res: Response
) => {
  try {
    if (typeof req.body.itActivo === "string") {
      req.body.itActivo =
        req.body.itActivo === "true" ||
        req.body.itActivo === "1";
    }

    const { id } = req.params;
    const newAuthor: Author = req.body;

    const parsed = authorUpdateValidation(newAuthor);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Datos de autor inválidos",
        errors: parsed.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        })),
        status: 400,
      });
    }

    // Si viene una nueva imagen
    if (req.file) {
      const avatar = await UploadAuthorService.uploadAuthor(
        req.file as Express.Multer.File
      );

      console.log("Avatar:", avatar);

      const authorWithImage = {
        ...newAuthor,

        // Ajusta estos nombres según tu clase photoProfile
        photoIdImage: avatar.photoIdImage,
        photoUrl: avatar.photorUrl,
      };

      const result = await updataAuthor.updateAuthor(
        id,
        authorWithImage
      );

      if (!result) {
        return res.status(404).json({
          msg: "Author not found",
        });
      }

      return res.status(200).json({
        msg: "author update successful",
        result,
      });
    }

    const result = await updataAuthor.updateAuthor(
      id,
      newAuthor
    );

    if (!result) {
      return res.status(404).json({
        msg: "author not found",
      });
    }

    return res.status(200).json({
      msg: "author update successful",
      result,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      msg: "internal server error",
    });
  }
};