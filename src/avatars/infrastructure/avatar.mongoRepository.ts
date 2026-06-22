
import { AvatarType } from "../domain/entities/AvatarsTypes";
import { IAvatar } from "../domain/ports/AvatarPorts";

import { deleteCoverImage } from "../../shared/utils/deleteCoverImage";
import { prisma } from "../../shared/lib/prisma";

export class AvatarPostgresRepository implements IAvatar {

	async saveAvatar(avatar: AvatarType): Promise<AvatarType> {

		return await prisma.avatar.create({
			data: {
				idImage: avatar.idImage,
				urlSecura: avatar.urlSecura,
				gender: avatar.gender
			}
		});
	}

	async findAvatars(): Promise<AvatarType[]> {

		return await prisma.avatar.findMany();
	}

	async findAvatarById(id: string): Promise<AvatarType | null> {

		return await prisma.avatar.findUnique({
			where: {
				id
			}
		});
	}

	async updateAvatar(
		id: string,
		avatar: Partial<AvatarType>
	): Promise<AvatarType | null> {

		return await prisma.avatar.update({
			where: {
				id
			},
			data: {
				idImage: avatar.idImage,
				urlSecura: avatar.urlSecura,
				gender: avatar.gender
			}
		});
	}

	async deleteAvatar(id: string): Promise<void | null> {

		const avatar = await prisma.avatar.findUnique({
			where: {
				id
			}
		});

		if (!avatar) {
			return null;
		}

		await deleteCoverImage(avatar.idImage);

		await prisma.avatar.delete({
			where: {
				id
			}
		});
	}
}