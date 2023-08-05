import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
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
    ref: "posts",
    required: false,
    default: null,
  },
  isRead: {
    type: Boolean,
    default: false,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const Notification = mongoose.model("notifications", notificationSchema);

const createNotification = async (notification) => {
  try {
    const newNotification = new Notification(notification);
    const result = await newNotification.save();

    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({ receiver: userId })
      .populate("sender")
      .populate("reference")
      .sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    throw new Error(error);
  }
};

const getNotReadNotifications = async (userId) => {
  try {
    const notifications = await Notification.find({
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

const readNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return notification;
  } catch {
    throw new Error(error);
  }
};

const deleteNotification = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndDelete(notificationId);

    return notification;
  } catch (error) {
    throw new Error(error);
  }
};

export {
  createNotification,
  getNotifications,
  getNotReadNotifications,
  readNotification,
  deleteNotification,
};
