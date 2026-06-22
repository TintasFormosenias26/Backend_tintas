import { fileDelete } from "../utils/deleteFile";
import { photoProfile } from "../types/photo.Types";
import { subirAuthorimg } from "../utils/img/avatarUser";

export class UploadAuthorService {
    static async uploadAuthor(file: Express.Multer.File): Promise<photoProfile> {
        if (!file) throw new Error("No se recibió ningún archivo");

        console.log("Archivo:", file.path);

        try {
            const result = await subirAuthorimg(file.path);

            console.log("Resultado Cloudinary:", result);

            if (!result?.secure_url || !result?.public_id) {
                throw new Error("Cloudinary no devolvió secure_url o public_id");
            }

            await fileDelete(file.path);

            return new photoProfile(
                result.public_id,
                result.secure_url
            );

        } catch (error) {
            console.error("ERROR CLOUDINARY:", error);
            throw error;
        }
    }
}

