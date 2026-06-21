import { v2 as cloudinary } from "cloudinary";
import ENV from "../../config/configEnv";

cloudinary.config({
    cloud_name: ENV.CLOUD_NAME,
    api_key: ENV.API_KEY,
    api_secret: ENV.API_SECRET,
});

export async function subirImagen(rutaArchivo: string) {
    try {
        console.log("Archivo:", rutaArchivo);

        const fs = await import("fs");

        console.log("Existe:", fs.existsSync(rutaArchivo));

        const stats = fs.statSync(rutaArchivo);

        console.log("Peso:", stats.size);

        return await cloudinary.uploader.upload(rutaArchivo, {
            folder: "User_avatar",
        });
    } catch (error) {
        console.error("Cloudinary Error:", error);
        throw error;
    }
}
export async function subirAuthorimg(rutaArchivo: string) {
    try {
        const result = await cloudinary.uploader.upload(rutaArchivo, { folder: "Author_fotos" });
        return result;
    } catch (error) {
        console.log(error)
    }
}