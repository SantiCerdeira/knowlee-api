import multer from "multer";
import { fileURLToPath } from "url";
import path from "path";
import s3Client from "../services/s3Client.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const storage = multer.memoryStorage();
const fileUpload = multer({ storage }).single("file");

const pdfUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { originalname, buffer } = req.file;

    const s3Key = `${Date.now()}-${originalname}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);

    await s3Client.send(command);

    req.fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${s3Key}`;

    next();
  } catch (err) {
    console.error("Ocurrió un error al subir el archivo:", err);
    res.status(500).json({ error: "Ocurrió un error al subir el archivo" });
  }
};

export { fileUpload, pdfUpload };
