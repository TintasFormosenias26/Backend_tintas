import { v2 as cloudinary } from "cloudinary";
import ENV from "../config/configEnv";


cloudinary.config({
  cloud_name: ENV.CLOUD_NAME,
  api_key: ENV.API_KEY,
  api_secret: ENV.API_SECRET,
});

export async function uploadCoverImage(filePhat: string) {
  try {
    const result = await cloudinary.uploader.upload(filePhat, { folder: "BooksCovers" });

    console.log("✅Imagen subida exitosamente:", result.secure_url);

    return result;
  } catch (error) {
    console.log();
    console.log();
    console.log(error);
    console.log();
  }
}
