import {
  createGroupNotification,
  getGroupNotifications,
  getNotReadGroupNotifications,
  readGroupNotification,
  deleteGroupNotification,
} from "../models/GroupNotification.js";

const newGroupNotification = async ({ sender, receiver, type, reference }) => {
  try {
    const notification = await createGroupNotification({
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

const getGroupNotificationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getGroupNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener las notificaciones" });
  }
};

const getNotReadGroupNotificationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await getNotReadGroupNotifications(userId);
    res.status(200).json(notifications);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener las notificaciones" });
  }
};

const readGroupNotificationById = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await readGroupNotification(notificationId);
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al leer la notificación" });
  }
};

const deleteGroupNotificationById = async (req, res) => {
  const { notificationId } = req.params;
  try {
    const notification = await deleteGroupNotification(notificationId);
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
  newGroupNotification,
  getGroupNotificationsByUser,
  getNotReadGroupNotificationsByUser,
  readGroupNotificationById,
  deleteGroupNotificationById,
};
