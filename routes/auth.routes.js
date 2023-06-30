import express from "express";
import * as authController from "../controllers/auth-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get('/isAuthenticated', isAuthenticated , authController.isAuthenticated)
router.get('/user-id', isAuthenticated , authController.getUserId)
router.post('/registro', authController.register)
router.post('/login', authController.login)
router.get('/users/:id', isAuthenticated,  authController.getUserById)
router.get('/users', isAuthenticated,  authController.getAllUsers)
router.get('/users/authenticated/:id', isAuthenticated,  authController.getAuthenticatedUserById)
router.get('/reset-password/:email', authController.requestPasswordReset)

export default router;