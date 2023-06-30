import express from "express";
import * as commentsController from "../controllers/comments-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post('/create-comment', isAuthenticated,  commentsController.newComment)
router.get('/get-comments/:postId', isAuthenticated, commentsController.getCommentsOfPost)
router.delete('/comment/:commentId', isAuthenticated,  commentsController.deleteById)

export default router;