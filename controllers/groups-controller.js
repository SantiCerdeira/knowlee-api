import {
  createGroup,
  checkIfGroupNameExists,
  getGroups,
  getGroupById,
  getGroupMembers,
  deleteGroupById,
  getGroupAdmins,
  addMemberToGroup,
  removeMemberFromGroup,
  updateGroupDescription,
  updateGroupProfileImage,
} from "../models/Group.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client.js";
import path from "path";

const DEFAULT_GROUP_IMAGE =
  "https://knowleeimages.s3.sa-east-1.amazonaws.com/4abvz-logo-fondo-azul.jpg";

const newGroup = async (req, res) => {
  try {
    const { name, description, date } = req.body;

    const groupExists = await checkIfGroupNameExists(name);
    if (groupExists) {
      return res
        .status(400)
        .json({ message: "Ya existe un grupo con ese nombre" });
    }

    const posts = [];
    const members = [];
    const admins = [];

    members.push(req.body.members);
    admins.push(req.body.admins);
    let image = null;

    if (req.file && req.savedFileName) {
      image = req.savedFileName;
    } else {
      image = DEFAULT_GROUP_IMAGE;
    }

    await createGroup({
      name,
      description,
      image,
      members,
      posts,
      admins,
      date,
    });

    return res
      .status(201)
      .json({ message: "Grupo creado con éxito", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la publicación", status: "error" });
    console.log(error);
  }
};

const getAllGroups = async (req, res) => {
  try {
    const groups = await getGroups();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener los grupos" });
  }
};

const getOneGroupById = async (req, res) => {
  const { groupId } = req.params;
  console.log(groupId);
  try {
    const group = await getGroupById(groupId);
    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener el grupo" });
  }
};

const getAllGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const groupMembers = await getGroupMembers(groupId);
    res.status(200).json(groupMembers);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener los miembros del grupo" });
  }
};

const deleteById = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await getGroupById(groupId);

    if (group.image && group.image !== DEFAULT_GROUP_IMAGE) {
      const key = path.basename(group.image);

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);

      await s3Client.send(deleteCommand);
    }

    await deleteGroupById(groupId);

    res.status(200).json({
      message: "Grupo eliminado con éxito",
      status: "success",
      group,
    });
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al eliminar el grupo" });
  }
};

const getAdminsOfGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    const admins = await getGroupAdmins(groupId);
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al obtener los admins" });
  }
};

const addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  try {
    const group = await addMemberToGroup(groupId, userId);
    res.status(200).json({
      message: "Te uniste al grupo",
      status: "success",
      group,
    });
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al unirte al grupo" });
  }
};

const removeMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;
  try {
    const group = await removeMemberFromGroup(groupId, userId);
    res.status(200).json({
      message: "Saliste del grupo",
      status: "success",
      group,
    });
  } catch (error) {
    res.status(500).json({ error: "Ocurrió un error al sacarte del grupo" });
  }
};

const updateDescription = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description } = req.body;

    console.log(groupId, description);

    await updateGroupDescription(groupId, description);

    return res.status(200).json({
      message: "Descripción actualizada correctamente",
      status: "success",
      description: description,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Ocurrió un error al actualizar la descripción",
      status: "error",
    });
  }
};

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No has seleccionado ninguna imagen",
        status: "error",
      });
    }

    const fileName = req.savedFileName;

    await updateGroupProfileImage(req.params.groupId, fileName);

    return res.status(200).json({
      message: "Imagen subida correctamente",
      status: "success",
      image: fileName,
    });
  } catch (error) {
    console.error("Ocurrió un error al subir la imagen:", error);
    return res.status(500).json({
      message: "Ocurrió un error al subir la imagen",
      status: "error",
    });
  }
};

const deleteImage = async (req, res) => {
  const { groupId } = req.params;
  try {
    const group = await getGroupById(groupId);

    if (group.image && group.image !== DEFAULT_GROUP_IMAGE) {
      const key = path.basename(group.image);

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);

      await s3Client.send(deleteCommand);
    }

    await updateGroupProfileImage(groupId, DEFAULT_GROUP_IMAGE);

    return res.status(200).json({
      message: "Imagen eliminada correctamente",
      status: "success",
      image: DEFAULT_GROUP_IMAGE,
    });
  } catch (error) {
    console.error("Ocurrió un error al eliminar la imagen:", error);
    return res.status(500).json({
      message: "Ocurrió un error al eliminar la imagen",
      status: "error",
    });
  }
};

export {
  newGroup,
  getAllGroups,
  getOneGroupById,
  getAllGroupMembers,
  deleteById,
  getAdminsOfGroup,
  addMember,
  removeMember,
  updateDescription,
  uploadImage,
  deleteImage,
};
