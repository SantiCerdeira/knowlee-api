import {
  createComment,
  getPostComments,
  deleteCommentById,
} from "../models/Comment.js";
import { newNotification } from "./notifications-controller.js";
import { newGroupNotification } from "./groups-notifications-controller.js";

const newComment = async (req, res) => {
  const { author, post, content, date } = req.body;
  try {
    const { comment, postWithData } = await createComment({
      author,
      post,
      content,
      date,
    });

    if (postWithData.group) {
      if (author !== postWithData.author.toString()) {
        await newGroupNotification({
          sender: author,
          receiver: postWithData.author,
          type: "comment",
          reference: post,
        });
      }
    } else {
      if (author !== postWithData.author.toString()) {
        await newNotification({
          sender: author,
          receiver: postWithData.author,
          type: "comment",
          reference: post,
        });
      }
    }

    return res
      .status(201)
      .json({ message: "Comentario publicado con éxito", status: "success" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al publicar el comentario", status: "error" });
    console.log(error);
  }
};

const getCommentsOfPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const comments = await getPostComments(postId);
    return res.status(200).json(comments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener los comentarios", status: "error" });
    console.log(error);
  }
};

const deleteById = async (req, res) => {
  const commentId = req.params.commentId;

  try {
    const comment = await deleteCommentById(commentId);
    res.status(200).json({
      message: "Comentario eliminado con éxito",
      status: "success",
      comment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el comentario", status: "error" });
  }
};

export { newComment, getCommentsOfPost, deleteById };
