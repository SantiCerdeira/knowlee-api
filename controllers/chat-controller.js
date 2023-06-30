import {newMessage, getOrCreateChat} from '../models/Chat.js'

const createOrGetChat = async (req, res) => {
    const { participants } = req.body;

    try {
      const chat = await getOrCreateChat(participants);
      res.json(chat);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get or create chat' });
    }
  };
  

const sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { message } = req.body;

    try {
        const sentMessage = await newMessage(chatId, message)
        res.status(200).json({ message: "Mensaje enviado con éxito", status: "success" , newMessage: sentMessage});
    } catch (error) {
        res.status(500).json({message: "Ocurrió un error al enviar el mensaje",status: "error",});
    }
}

export {
    createOrGetChat,
    sendMessage
}