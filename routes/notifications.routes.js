import express from "express";
import * as notificationsController from "../controllers/notifications-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get('/notifications/:userId', isAuthenticated, notificationsController.getNotificationsByUser)
router.get('/notifications/not-read/:userId', isAuthenticated, notificationsController.getNotReadNotificationsByUser)
router.patch('/notification/:notificationId', isAuthenticated, notificationsController.readNotificationById)

export default router;