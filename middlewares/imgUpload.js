import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client.js";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import sharp from "sharp";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("profileImage");

const fileSizeLimit = 1 * 1024 * 1024;
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/avif",
];

const imgUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "El archivo debe ser un PNG, JPEG, JPG, WEBP o AVIF.",
        status: "error",
      });
    }

    if (req.file.size > fileSizeLimit) {
      return res.status(400).json({
        message: "El archivo excede el límite de tamaño de 1MB.",
        status: "error",
      });
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(800)
      .jpeg({ quality: 75 })
      .toBuffer();

    const { originalname } = req.file;

    const randomName = Math.random().toString(36).substring(7);

    const s3Key = `${randomName}-${originalname}`;

    if (req.body.userImage) {
      const key = path.basename(req.body.userImage);

      if (key !== "default-user-image.png") {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: key,
        };

        const deleteCommand = new DeleteObjectCommand(deleteParams);

        await s3Client.send(deleteCommand);
      }
    }

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: optimizedBuffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);

    await s3Client.send(command);

    const encodedS3Key = encodeURIComponent(s3Key);
    const objectUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${encodedS3Key}`;

    req.savedFileName = objectUrl;
    console.log("Imagen subida correctamente", s3Key);
    next();
  } catch (err) {
    console.error("Error al subir la imagen:", err);
    res.status(500).json({ error: "Error al subir la imagen" });
  }
};

export { upload, imgUpload };
