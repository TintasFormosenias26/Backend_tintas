import { v2 as cloudinary } from "cloudinary";
import ENV from "../config/configEnv";

cloudinary.config({
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.API_KEY,
  api_secret: ENV.API_SECRET,
});

export async function uploadBook(rutaArchivo: string) {
  try {
    if (rutaArchivo.includes('.mp4')) {
      const result = await cloudinary.uploader.upload(rutaArchivo, { folder: "Books", resource_type: "video" });
      console.log("✅libro mp4 subido exitosamente:", result.secure_url);

      return result;
    }
    const result = await cloudinary.uploader.upload(rutaArchivo, { folder: "Books", resource_type: "raw" });

    console.log("✅libro subido exitosamente:", result.secure_url);

    return result;
  } catch (error) {
    console.log();
    console.log();
    console.log(error);
    console.log();
  }
}
