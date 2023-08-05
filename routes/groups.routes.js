import express from "express";
import * as groupsController from "../controllers/groups-controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { upload, groupImgUpload } from "../middlewares/groupImgUpload.js";

const router = express.Router();

router.get('/groups', isAuthenticated , groupsController.getAllGroups)
router.post('/groups', isAuthenticated , upload,  groupImgUpload,  groupsController.newGroup)
router.get('/group/:groupId', isAuthenticated , groupsController.getOneGroupById)
router.get('/group/:groupId/members', isAuthenticated , groupsController.getAllGroupMembers)
router.get('/group/:groupId/admins', isAuthenticated , groupsController.getAdminsOfGroup)
router.delete('/group/:groupId', isAuthenticated, groupsController.deleteById)
router.patch('/group/:groupId/add', isAuthenticated, groupsController.addMember)
router.patch('/group/:groupId/remove', isAuthenticated, groupsController.removeMember)
router.patch('/group/:groupId/description', isAuthenticated,  groupsController.updateDescription)
router.post('/group/:groupId/image', isAuthenticated , upload,  groupImgUpload,  groupsController.uploadImage)
router.delete('/group/:groupId/delete-image', isAuthenticated, groupsController.deleteImage)


export default router;