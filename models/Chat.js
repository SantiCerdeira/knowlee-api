import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      content: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Chat = mongoose.model("chats", chatSchema);

const findChat = async (participants) => {
  try {
    const chat = await Chat.findOne({ participants });
    return chat;
  } catch (error) {
    throw new Error("Failed to find chat");
  }
};

const createChat = async (participants) => {
  if (participants[0] === participants[1])
    throw new Error("No se puede crear un chat sin un segundo usuario");
  try {
    const chat = new Chat({ participants });
    await chat.save();
    return chat;
  } catch (error) {
    throw new Error("Failed to create chat");
  }
};

const getOrCreateChat = async (participants) => {
  try {
    const sortedParticipants = participants.sort();
    let chat = await findChat(sortedParticipants);

    if (!chat) {
      chat = await createChat(sortedParticipants);
    }

    return chat;
  } catch (error) {
    throw new Error("Failed to get or create chat");
  }
};

const newMessage = async (chatId, message) => {
  try {
    const chat = await Chat.findById(chatId);
    chat.messages.push(message);
    await chat.save();
    return message;
  } catch (error) {
    throw new Error(error);
  }
};

export { getOrCreateChat, newMessage };
