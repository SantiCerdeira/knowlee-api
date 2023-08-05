import {
  createNotification,
  getNotifications,
  getNotReadNotifications,
  readNotification,
  deleteNotification,
} from "../models/Notification.js";

const newNotification = async ({ sender, receiver, type, reference }) => {
  try {
    const notification = await createNotification({
      sender,
      receiver,
      type,
      reference,
    });
    return notification;
  } catch (error) {
    throw new Error("Ocurrió un error al crear la notificación");
  }
};

const getNotificationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener las notificaciones" });
  }
};

const getNotReadNotificationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getNotReadNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener las notificaciones" });
  }
};

const readNotificationById = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await readNotification(notificationId);
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al leer la notificación" });
  }
};

const deleteNotificationById = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await deleteNotification(notificationId);
    res.status(200).json({
      message: "Notificación eliminada",
      status: "success",
      notification,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al eliminar la notificación" });
  }
};

export {
  newNotification,
  getNotificationsByUser,
  getNotReadNotificationsByUser,
  readNotificationById,
  deleteNotificationById,
};
