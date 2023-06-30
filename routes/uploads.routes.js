import express from "express";
import * as uploadsController from "../controllers/uploads-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload, imgUpload } from "../middlewares/imgUpload.js";

const router = express.Router();

router.post('/upload', isAuthenticated,  upload, imgUpload, uploadsController.uploadImage)
router.delete('/delete-image', isAuthenticated, uploadsController.deleteImage)

export default router;