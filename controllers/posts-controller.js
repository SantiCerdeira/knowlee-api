import {
  createPost,
  getPostsByUserId,
  getPosts,
  deletePostById,
  likePost,
  unlikePost,
  getPostById,
  ratePost,
  deletePostRating,
} from "../models/Post.js";
import path from "path";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_PUBLIC_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const newPost = async (req, res) => {
  try {
    const { title, content, author, date, name, lastName, premium } = req.body;

    let fileName = null;

    if (req.file) {
      fileName = req.fileUrl;
    }

    await createPost({
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

const getUserPosts = async (req, res) => {
  const userId = req.params.userId;

  try {
    const posts = await getPostsByUserId(userId);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Ocurrió un error al obtener las publicaciones del usuario",
      });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await getPosts();
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener las publicaciones" });
  }
};

const deleteById = async (req, res) => {
  const postId = req.params.postId;

  try {
    let post = await getPostById(postId);

    if (post.fileName) {
      const key = path.basename(post.fileName);

      const deleteParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      };

      const deleteCommand = new DeleteObjectCommand(deleteParams);

      await s3Client.send(deleteCommand);
    }

    post = await deletePostById(postId);
    res
      .status(200)
      .json({
        message: "Publicación eliminada con éxito",
        status: "success",
        post,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar la publicación", status: "error" });
  }
};

const like = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await likePost(postId, userId);
    res
      .status(200)
      .json({ message: "Te gusta esta publicación", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ocurrió un error al dar me gusta", status: "error" });
    console.log(error);
  }
};

const unlike = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await unlikePost(postId, userId);
    res
      .status(200)
      .json({ message: "Ya no te gusta esta publicación", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({
        message: 'Ocurrió un error al quitar tu "me gusta"',
        status: "error",
      });
  }
};

const getSinglePost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await getPostById(postId);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: "Ocurrió un error al obtener la publicación" });
  }
};

const rate = async (req, res, next) => {
  try {
    const { userId, rating } = req.body;
    const postId = req.params.postId;

    const post = await ratePost(postId, userId, rating);

    res
      .status(200)
      .json({ message: "Valoraste ésta publicación", status: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Ocurrió un error al valorar la publicación",
        status: "error",
      });
  }
};

const deleteRating = async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = req.params.postId;

    const post = await deletePostRating(postId, userId);

    res
      .status(200)
      .json({ message: "Valoración eliminada con éxito", status: "success" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        message: "Ocurrió un error al eliminar tu valoración",
        status: "error",
      });
  }
};

export {
  newPost,
  getUserPosts,
  getAllPosts,
  deleteById,
  like,
  unlike,
  getSinglePost,
  rate,
  deleteRating,
};
