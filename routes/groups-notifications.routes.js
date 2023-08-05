import express from "express";
import * as groupNotificationsController from "../controllers/groups-notifications-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.get('/group-notifications/:userId', isAuthenticated, groupNotificationsController.getGroupNotificationsByUser)
router.get('/group-notifications/not-read/:userId', isAuthenticated, groupNotificationsController.getNotReadGroupNotificationsByUser)
router.patch('/group-notification/:notificationId', isAuthenticated, groupNotificationsController.readGroupNotificationById)

export default router;