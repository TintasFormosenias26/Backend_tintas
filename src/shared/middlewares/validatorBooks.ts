import { ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import { fileDelete } from "../utils/deleteFile";
import { sendError } from "./errorHandler";


export const validatorBooks = <T>(schema: ZodSchema<T>) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = schema.safeParse(req.body);

      if (result.success) {
        next();
        return;
      }

      const files = req.files as { [key: string]: Express.Multer.File[] } | undefined;

      const deleteUploadedFiles = async () => {
        if (files?.img?.[0]) await fileDelete(files.img[0].path);
        if (files?.file?.[0]) await fileDelete(files.file[0].path);
      };

      const missingFileMsg = (): string => {
        if (!files?.file?.[0] && !files?.img?.[0]) return "Debes subir el contenido y la portada del libro";
        if (!files?.file?.[0]) return "Debes subir el contenido de texto del libro";
        if (!files?.img?.[0]) return "Debes subir la portada del libro";
        return "";
      };

      // Si no hay archivos subidos
      if (!files || !files.file?.[0] || !files.img?.[0]) {
        await deleteUploadedFiles();
        sendError(res, 400, "FILES_REQUIRED", missingFileMsg());
        return;
      }

      // Si hay errores de validación
      await deleteUploadedFiles();
      sendError(res, 422, "VALIDATION_ERROR", "Revisá los campos indicados.", {
        fields: result.error.issues.map((err) => ({
          path: err.path.length ? err.path.join(".") : "general",
          message: err.message,
        })),
      });
      return;
    } catch (error) {
      next(error);
    }
  };
};
