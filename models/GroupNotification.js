import mongoose from "mongoose";

const groupNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group-posts",
    required: false,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
    required: true,
  },
  group: {
    type: Boolean,
    default: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const GroupNotification = mongoose.model(
  "group-notifications",
  groupNotificationSchema
);

const createGroupNotification = async (notification) => {
  try {
    const newNotification = new GroupNotification(notification);
    const result = await newNotification.save();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupNotifications = async (userId) => {
  try {
    const notifications = await GroupNotification.find({ receiver: userId })
      .populate("sender")
      .populate("reference")
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    throw new Error(error);
  }
};

const getNotReadGroupNotifications = async (userId) => {
  try {
    const notifications = await GroupNotification.find({
      receiver: userId,
      isRead: false,
    })
      .populate("sender")
      .populate("reference")
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    throw new Error(error);
  }
};

const readGroupNotification = async (notificationId) => {
  try {
    const notification = await GroupNotification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch {
    throw new Error(error);
  }
};

const deleteGroupNotification = async (notificationId) => {
  try {
    const notification = await GroupNotification.findByIdAndDelete(
      notificationId
    );

    return notification;
  } catch (error) {
    throw new Error(error);
  }
};

export {
  createGroupNotification,
  getGroupNotifications,
  getNotReadGroupNotifications,
  readGroupNotification,
  deleteGroupNotification,
};
