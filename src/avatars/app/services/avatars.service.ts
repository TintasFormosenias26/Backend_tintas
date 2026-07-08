import { AvatarType } from "../../domain/entities/AvatarsTypes";
import { IAvatar } from "../../domain/ports/AvatarPorts";
import { deleteCoverImage } from "../../../shared/utils/deleteCoverImage";
import { HttpError } from "../../../authorService/app/service/UpdateAuthor.service";


export class AvatarsService implements IAvatar {
	constructor(
		private readonly avatarRepo: IAvatar
	) { }
	async saveAvatar(avatar: AvatarType): Promise<AvatarType> {
		const newAvatar = avatar;
		return await this.avatarRepo.saveAvatar(newAvatar)
	}

	async deleteAvatar(id: String): Promise<void> {
		const avatar = await this.avatarRepo.findAvatarById(id);
		if (!avatar) {
			console.warn("level not found")
			throw new HttpError(404, "level not found.");
		}

		if (avatar.idImage) {
			const deleted = await deleteCoverImage(avatar.idImage);
			if (!deleted) {
				console.warn(`No se pudo eliminar la imagen de Cloudinary: ${avatar}`);
			}
		}
		await this.avatarRepo.deleteAvatar(id)
	}
	async findAvatars(): Promise<AvatarType[]> {
		return await this.avatarRepo.findAvatars()
	}
	async findAvatarById(id: any): Promise<AvatarType | null> {
		return await this.avatarRepo.findAvatarById(id)
	}

	async updateAvatar(id: String, avatar: AvatarType): Promise<AvatarType | null> {
		return await this.avatarRepo.updateAvatar(id, avatar);
	}
}