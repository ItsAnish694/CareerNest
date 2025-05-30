import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadCloudinary(localFilePath) {
  if (!localFilePath) return null;

  try {
    const uploadFile = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    if (!uploadFile) return null;

    await fs.unlink(localFilePath);

    return uploadFile;
  } catch (error) {
    return null;
  }
}
