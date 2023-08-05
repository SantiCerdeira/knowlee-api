import { findUserById } from "../models/User.js";
import { updateUserProfileImage } from "../models/User.js";
import path from "path";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client.js";
import dotenv from "dotenv";

dotenv.config();
const DEFAULT_IMAGE_NAME =
  "https://knowleeimages.s3.sa-east-1.amazonaws.com/default-user-image.png";

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No has seleccionado ninguna imagen",
        status: "error",
      });
    }

    const fileName = req.savedFileName;

    await updateUserProfileImage(req.user.userId, fileName);

    return res.status(200).json({
      message: "Imagen subida correctamente",
      status: "success",
      profileImage: fileName,
    });
  } catch (error) {
    console.error("Ocurrió un error al subir la imagen:", error);
    return res.status(500).json({
      message: "Ocurrió un error al subir la imagen",
      status: "error",
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const user = await findUserById(req.user.userId);

    if (user.profileImage && user.profileImage !== DEFAULT_IMAGE_NAME) {
      const key = path.basename(user.profileImage);

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);

      await s3Client.send(deleteCommand);
    }

    await updateUserProfileImage(req.user.userId, DEFAULT_IMAGE_NAME);

    return res.status(200).json({
      message: "Imagen eliminada correctamente",
      status: "success",
      profileImage: DEFAULT_IMAGE_NAME,
    });
  } catch (error) {
    console.error("Ocurrió un error al eliminar la imagen:", error);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar la imagen",
      status: "error",
    });
  }
};

export { uploadImage, deleteImage };
