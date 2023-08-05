import {
  createGroupPost,
  getGroupPostsByUserId,
  getGroupPosts,
  deleteGroupPostById,
  likeGroupPost,
  unlikeGroupPost,
  getGroupPostById,
  rateGroupPost,
  deleteGroupPostRating,
} from "../models/GroupPost.js";
import { checkUserMembership, checkUserAdminStatus } from "../models/Group.js";
import path from "path";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { newGroupReport } from "../models/GroupReport.js";
import { newGroupNotification } from "./groups-notifications-controller.js";
import s3Client from "../services/s3Client.js";
import dotenv from "dotenv";

dotenv.config();

const newGroupPost = async (req, res) => {
  try {
    const { group, title, content, author, date, name, lastName, premium } =
      req.body;

    let fileName = null;

    if (req.file) {
      fileName = req.fileUrl;
    }

    await createGroupPost({
      group,
      title,
      content,
      author,
      date,
      fileName,
      name,
      lastName,
      premium,
    });

    return res
      .status(201)
      .json({ message: "Publicación creada con éxito", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al crear la publicación", status: "error" });
    console.log(error);
  }
};

const getUserGroupPosts = async (req, res) => {
  const userId = req.params.userId;
  console.log(userId);

  try {
    const posts = await getGroupPostsByUserId(userId);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones", status: "error" });
    console.log(error);
  }
};

const getPostsFromGroup = async (req, res) => {
  const groupId = req.params.groupId;
  try {
    const posts = await getGroupPosts(groupId);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las publicaciones", status: "error" });
    console.log(error);
  }
};

const deleteGroupPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await deleteGroupPostById(postId);
    if (post.fileName) {
      const fileName = path.basename(post.fileName);
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
      };
      await s3Client.send(new DeleteObjectCommand(params));
    }
    res.status(200).json({
      message: "Publicación eliminada con éxito",
      status: "success",
      post,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la publicación", status: "error" });
    console.log(error);
  }
};

const likeGroupPostById = async (req, res) => {
  const postId = req.params.postId;
  const { userId } = req.body;
  try {
    const post = await likeGroupPost(postId, userId);

    if (userId !== post.author.toString()) {
      await newGroupNotification({
        sender: userId,
        receiver: post.author,
        type: "like",
        reference: postId,
      });
    }

    res
      .status(200)
      .json({ message: "Te gusta esta publicación", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al dar like a la publicación", status: "error" });
    console.log(error);
  }
};

const unlikeGroupPostById = async (req, res) => {
  const postId = req.params.postId;
  const { userId } = req.body;
  try {
    const post = await unlikeGroupPost(postId, userId);
    res
      .status(200)
      .json({ message: "Ya no te gusta esta publicación", status: "success" });
  } catch (error) {
    res.status(500).json({
      message: "Error al quitar like a la publicación",
      status: "error",
    });
    console.log(error);
  }
};

const getGroupPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await getGroupPostById(postId);

    const userId = req.user.userId;
    const isMember = await checkUserMembership(userId, post.group);
    const isAdmin = await checkUserAdminStatus(userId, post.group);

    const responseData = {
      ...post,
      isMember,
      isAdmin,
    };

    res.status(200).json(responseData);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener la publicación", status: "error" });
    console.log(error);
  }
};

const rateGroupPostById = async (req, res) => {
  const postId = req.params.postId;
  const { userId, rating } = req.body;
  try {
    const post = await rateGroupPost(postId, userId, rating);

    if (userId !== post.author.toString()) {
      await newGroupNotification({
        sender: userId,
        receiver: post.author,
        type: "rating",
        reference: postId,
      });
    }

    res
      .status(200)
      .json({ message: "Valoraste ésta publicación", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al calificar la publicación", status: "error" });
    console.log(error);
  }
};

const deleteGroupPostRatingById = async (req, res) => {
  const postId = req.params.postId;
  const { userId } = req.body;
  try {
    const post = await deleteGroupPostRating(postId, userId);
    res
      .status(200)
      .json({ message: "Valoración eliminada con éxito", status: "success" });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar la calificación de la publicación",
      status: "error",
    });
    console.log(error);
  }
};

const reportGroupPost = async (req, res) => {
  try {
    const { userId, message } = req.body;
    const postId = req.params.postId;

    const post = await newGroupReport(userId, postId, message);

    res
      .status(200)
      .json({ message: "Se envió tu comentario", status: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Ocurrió un error al enviar tu comentario",
      status: "error",
    });
  }
};

export {
  newGroupPost,
  getUserGroupPosts,
  getPostsFromGroup,
  deleteGroupPost,
  likeGroupPostById,
  unlikeGroupPostById,
  getGroupPost,
  rateGroupPostById,
  deleteGroupPostRatingById,
  reportGroupPost,
};
