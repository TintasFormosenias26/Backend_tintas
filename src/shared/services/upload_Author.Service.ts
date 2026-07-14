import { photoProfile } from "../types/photo.Types";
import { fileDelete } from "../utils/deleteFile";
import { subirAuthorimg } from "../utils/img/avatarUser";
import { BadRequestError } from "./BadReuestError";

export class UploadAuthorService {
    static async uploadAuthor(file: Express.Multer.File): Promise<photoProfile> {

        if (!file) {
            throw new BadRequestError("No se recibió ningún archivo");
        }

        try {
            const result = await subirAuthorimg(file.path);

            if (!result?.secure_url || !result?.public_id) {
                throw new BadRequestError("Cloudinary no devolvió la información esperada");
            }

            await fileDelete(file.path);

            return new photoProfile(
                result.public_id,
                result.secure_url
            );

        } catch (error) {
            throw error;
        }
    }
}