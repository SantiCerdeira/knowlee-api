import express from "express";
import * as usersController from "../controllers/users-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.patch('/description', isAuthenticated,  usersController.updateDescription)
router.patch('/follow', isAuthenticated,  usersController.followUserController)
router.patch('/unfollow', isAuthenticated,  usersController.unfollowUserController)
router.get('/:userId/followers', isAuthenticated,  usersController.getFollowerUserIds)
router.get('/:userId/following', isAuthenticated,  usersController.getFollowingUserIds)
router.patch('/premium', isAuthenticated,  usersController.buyPremium)
router.patch('/cancel-premium', isAuthenticated,  usersController.cancelPremium)
router.patch('/links', isAuthenticated,  usersController.setLinks)

export default router;