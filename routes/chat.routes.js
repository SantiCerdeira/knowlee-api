import express from 'express'
import * as chatController from '../controllers/chat-controller.js'
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router()

router.post('/chats', isAuthenticated, chatController.createOrGetChat)
router.post('/:chatId/message', isAuthenticated, chatController.sendMessage)

export default router