import express from "express";
import * as groupPostsController from "../controllers/groups-posts-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { fileUpload, pdfUpload } from "../middlewares/pdfUpload.js";
import { addWatermark } from "../middlewares/addWatermark.js";


const router = express.Router();

router.post('/group-posts', isAuthenticated, fileUpload, addWatermark, pdfUpload, groupPostsController.newGroupPost)
router.get('/group-posts/user/:userId', isAuthenticated, groupPostsController.getUserGroupPosts)
router.get('/group-posts/:groupId', isAuthenticated, groupPostsController.getPostsFromGroup)
router.delete('/group-posts/:postId', isAuthenticated, groupPostsController.deleteGroupPost)
router.patch('/group-posts/:postId/like', isAuthenticated, groupPostsController.likeGroupPostById);
router.delete('/group-posts/:postId/unlike', isAuthenticated, groupPostsController.unlikeGroupPostById);
router.get('/group-post/:postId', isAuthenticated, groupPostsController.getGroupPost);
router.patch('/group-posts/:postId/rate', isAuthenticated, groupPostsController.rateGroupPostById);
router.delete('/group-posts/:postId/rate', isAuthenticated, groupPostsController.deleteGroupPostRatingById);
router.post('/group-posts/:postId/report', isAuthenticated, groupPostsController.reportGroupPost);


export default router;