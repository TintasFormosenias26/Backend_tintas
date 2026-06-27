import { Request, Response } from "express";
import { UploadService } from "../../../shared/services/uploadAvatar.service";
import { AvatarsService } from "../../app/services/avatars.service";
import { AvatarType } from "../../domain/entities/AvatarsTypes";
import { IAvatar } from "../../domain/ports/AvatarPorts";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { AvatarPostgresRepository } from "../../infrastructure/avatar.mongoRepository"

const iAvatar: IAvatar = new AvatarPostgresRepository();
const avatarControllers = new AvatarsService(iAvatar);

// Extend Request type to include file property
interface MulterRequest extends Request {
	file?: Express.Multer.File;
}
export const saveAvatar = async (req: MulterRequest, res: Response) => {
	try {
		const gender = req.body.gender;
		const file = req.file;

		const avatarUploaded = await UploadService.uploadAvatar(file as Express.Multer.File);

		const date: AvatarType = {
			gender,
			urlSecura: avatarUploaded.photoUrl,
			idImage: avatarUploaded.photoIdImage
		};

		const result = await avatarControllers.saveAvatar(date);

		if (!result) {
			res.status(304).json({ msg: "The avatar was not saved" });
		}

		res.status(201).json({ msg: "The avatar was saved successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ msg: "Internal server error" });
	}
};

export const deleteAvatar = async (req: Request, res: Response) => {
	try {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const result = await avatarControllers.deleteAvatar(id);
		if (result === null) {
			res.status(404).json({ msg: "Avatar no encontrado " });
			return;
		}
		res.status(200).json({ msg: "Avatar eliminado exitosamente" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error interno del servidor" });
	}
};

export const getAvatars = async (req: Request, res: Response) => {
	try {
		const avatars = await avatarControllers.findAvatars();
		res.status(200).json(avatars);
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error interno al obtener los avatares" });
	}
};

export const updateAvatar = async (req: MulterRequest, res: Response) => {
	try {
		const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
		const gender = req.body.gender;
		const file = req.file;

		const existingAvatar = await avatarControllers.findAvatarById(id);
		if (!existingAvatar) {
			res.status(404).json({ msg: "Avatar no encontrado" });
			return
		}

		let avatarData: AvatarType = {
			gender,
			urlSecura: existingAvatar.urlSecura,
			idImage: existingAvatar.idImage,
		};

		if (file) {
			if (existingAvatar.idImage) await deleteCoverImage(existingAvatar.idImage);

			const avatarUploaded = await UploadService.uploadAvatar(file as Express.Multer.File);
			avatarData = {
				gender,
				urlSecura: avatarUploaded.photoUrl,
				idImage: avatarUploaded.photoIdImage,
			};
		}
		const updatedAvatar = await avatarControllers.updateAvatar(id, avatarData);
		if (!updatedAvatar) {
			res.status(404).json({ msg: "Avatar no encontrado para actualizar" });
			return
		}

		res.status(200).json({ msg: "Avatar actualizado exitosamente", avatar: updatedAvatar });
		return
	} catch (error) {
		console.error(error);
		res.status(500).json({ msg: "Error interno del servidor al actualizar el avatar" });
		return
	}
};
