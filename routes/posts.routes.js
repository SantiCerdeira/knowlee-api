import express from "express";
import * as postsController from "../controllers/posts-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { fileUpload, pdfUpload } from "../middlewares/pdfUpload.js";
import { addWatermark } from "../middlewares/addWatermark.js";


const router = express.Router();

router.get('/posts', isAuthenticated, postsController.getAllPosts)
router.post('/posts', isAuthenticated, fileUpload, addWatermark, pdfUpload, postsController.newPost)
router.get('/posts/:userId', isAuthenticated, postsController.getUserPosts)
router.get('/post/:postId', isAuthenticated, postsController.getSinglePost)
router.delete('/posts/:postId', isAuthenticated, postsController.deleteById)
router.patch('/posts/:postId/like', isAuthenticated, postsController.like);
router.delete('/posts/:postId/unlike', isAuthenticated, postsController.unlike);
router.patch('/posts/:postId/rate', isAuthenticated, postsController.rate);
router.delete('/posts/:postId/rate', isAuthenticated, postsController.deleteRating);


export default router;