import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage }).single("profileImage");

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const imgUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const { originalname, buffer } = req.file;

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
      Body: buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);

    await s3Client.send(command);

    const encodedS3Key = encodeURIComponent(s3Key);
    const objectUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${encodedS3Key}`;

    req.savedFileName = objectUrl;
    console.log("File uploaded successfully", s3Key);
    next();
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

export { upload, imgUpload };
