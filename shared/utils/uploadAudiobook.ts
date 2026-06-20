import { v2 as cloudinary } from "cloudinary";
import ENV from "../config/configEnv";

cloudinary.config({
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.API_KEY,
  api_secret: ENV.API_SECRET,
});

export async function uploadAudiobook(rutaArchivo: string) {
  try {
    const result = await cloudinary.uploader.upload(rutaArchivo, { folder: "Audiobooks", resource_type: "video" });

    console.log("audiolibro subido exitosamente:", result.secure_url);

    return result;
  } catch (error) {

    console.log(error);
  }
}
