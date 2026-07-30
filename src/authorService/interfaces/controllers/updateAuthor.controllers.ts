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
const updateAuthorService = new UpdateAuthor(updateAuthorRepo, findAuthorRepo);

export const updateAuthors = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (typeof req.body.isActivo === "string") {
      req.body.isActivo =
        req.body.isActivo === "true" || req.body.isActivo === "1";
    }

    let author: Partial<Author> = req.body;
    const parsed = authorUpdateValidation(author);

    if (!parsed.success) {
      res.status(parsed.status).json({
        success: false,
        message: parsed.message,
        errors: parsed.errors,
      });
      return;
    }

    author = parsed.data;

    if (req.file) {
      const uploadedPhoto = await UploadAuthorService.uploadAuthor(req.file);
      author = {
        ...author,
        photoUrl: uploadedPhoto.photoUrl,
        photoIdImage: uploadedPhoto.photoIdImage,
      };
    }

    const updatedAuthor = await updateAuthorService.updateAuthor(id, author);

    res.status(200).json({
      success: true,
      message: "Autor actualizado correctamente",
      author: updatedAuthor,
    });
  } catch (error: any) {
    res.status(error.statusCode ?? 500).json({
      success: false,
      message: error.message ?? "Error interno del servidor",
    });
  }
};
