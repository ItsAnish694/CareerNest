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
      resource_type: "raw",
    });
    return uploadFile;
  } catch (error) {
    return null;
  } finally {
    await fs.unlink(localFilePath);
  }
}

export const deleteCloudinary = async (originalLink) => {
  const linkArray = originalLink.split("/");
  const fileId = linkArray[linkArray.length - 1];
  const type = linkArray[5];
  const resource_type = linkArray[4];
  try {
    await cloudinary.api.delete_resources([fileId], {
      type,
      resource_type,
    });
  } catch (error) {
    return null;
  }
};
