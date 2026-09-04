import { NextFunction, Request, Response } from "express";
import { CreateAuthor } from "../../app/service/SaveAuthor.service";
import { ISaveAuthorRepository } from "../../domain/ports/saveAuthorRepository";
import { Author } from "../../domain/entidades/author.Types";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { authorValidation } from "../../app/validations/authorValidations";
import { UploadAuthorService } from "../../../shared/services/upload_Author.Service";
import { FindAuthorPostgresRepo, SaveAuthorPostgresRepo } from "../../infrastructure/authores.MongoRepo";
import { sendError } from "../../../shared/middlewares/errorHandler";

const saveAuthorMongo: ISaveAuthorRepository = new SaveAuthorPostgresRepo();
const findAuthorRepo = new FindAuthorPostgresRepo();

const authorService = new CreateAuthor(saveAuthorMongo, findAuthorRepo);

export const createAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (typeof req.body.isActivo === "string") {
      req.body.isActivo = req.body.isActivo === "true" || req.body.isActivo === "1";
    }
    const author: Author = req.body;
    const file = req.file;

    const parsed = authorValidation(author);

    if (!parsed.success) {
      return sendError(res, 422, "VALIDATION_ERROR", "Revisá los campos indicados.", {
        fields: parsed.errors.map(error => ({
          field: error.path.join('.'),
          message: error.message
        }))
      });
    }

    if (!file) return sendError(res, 400, "FILE_REQUIRED", "Seleccioná una imagen para el autor.");
    const avatarUploaded = await UploadAuthorService.uploadAuthor(file);
    const newAuthor = {
      ...author,
      photoUrl: avatarUploaded.photoUrl,
      photoIdImage: avatarUploaded.photoIdImage,
    };

    const result = await authorService.saveAuthors(newAuthor);
    if (!result) {
      await deleteCoverImage(avatarUploaded.photoIdImage);
      return sendError(res, 409, "AUTHOR_ALREADY_EXISTS", "El autor ya existe.");
    }

    return res.status(201).json({ success: true, message: "Autor creado correctamente." });


  } catch (error: unknown) {
    return next(error);
  }
};
