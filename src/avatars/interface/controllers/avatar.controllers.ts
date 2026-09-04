import { NextFunction, Request, Response } from "express";
import { UploadService } from "../../../shared/services/uploadAvatar.service";
import { AvatarsService } from "../../app/services/avatars.service";
import { AvatarType } from "../../domain/entities/AvatarsTypes";
import { IAvatar } from "../../domain/ports/AvatarPorts";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { AvatarPostgresRepository } from "../../infrastructure/avatar.mongoRepository"
import { sendError } from "../../../shared/middlewares/errorHandler";

const iAvatar: IAvatar = new AvatarPostgresRepository();
const avatarControllers = new AvatarsService(iAvatar);

// Extend Request type to include file property
interface MulterRequest extends Request {
	file?: Express.Multer.File;
}
export const saveAvatar = async (req: MulterRequest, res: Response, next: NextFunction) => {
	try {
		const gender = req.body.gender;
		const file = req.file;

		if (!file) return sendError(res, 400, "FILE_REQUIRED", "Seleccioná una imagen para el avatar.");
		const avatarUploaded = await UploadService.uploadAvatar(file);

		const date: AvatarType = {
			gender,
			urlSecura: avatarUploaded.photoUrl,
			idImage: avatarUploaded.photoIdImage
		};

		const result = await avatarControllers.saveAvatar(date);

		if (!result) {
			return sendError(res, 409, "AVATAR_NOT_SAVED", "No se pudo guardar el avatar.");
		}

		return res.status(201).json({ success: true, message: "Avatar guardado correctamente." });
	} catch (error) {
		return next(error);
	}
};

export const deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const result = await avatarControllers.deleteAvatar(id);
		if (result === null) {
			return sendError(res, 404, "AVATAR_NOT_FOUND", "No se encontró el avatar.");
		}
		return res.status(200).json({ success: true, message: "Avatar eliminado correctamente." });
	} catch (error) {
		return next(error);
	}
};

export const getAvatars = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		const avatars = await avatarControllers.findAvatars();
		return res.status(200).json(avatars);
	} catch (error) {
		return next(error);
	}
};

export const updateAvatar = async (req: MulterRequest, res: Response, next: NextFunction) => {
	try {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const gender = req.body.gender;
		const file = req.file;

		const existingAvatar = await avatarControllers.findAvatarById(id);
		if (!existingAvatar) {
			return sendError(res, 404, "AVATAR_NOT_FOUND", "No se encontró el avatar.");
		}

		let avatarData: AvatarType = {
			gender,
			urlSecura: existingAvatar.urlSecura,
			idImage: existingAvatar.idImage,
		};

		if (file) {
			if (existingAvatar.idImage) await deleteCoverImage(existingAvatar.idImage);

			const avatarUploaded = await UploadService.uploadAvatar(file);
			avatarData = {
				gender,
				urlSecura: avatarUploaded.photoUrl,
				idImage: avatarUploaded.photoIdImage,
			};
		}
		const updatedAvatar = await avatarControllers.updateAvatar(id, avatarData);
		if (!updatedAvatar) {
			return sendError(res, 404, "AVATAR_NOT_FOUND", "No se encontró el avatar.");
		}

		return res.status(200).json({ success: true, message: "Avatar actualizado correctamente.", avatar: updatedAvatar });
	} catch (error) {
		return next(error);
	}
};
