import {
  createComment,
  getPostComments,
  deleteCommentById,
} from "../models/Comment.js";

const newComment = async (req, res) => {
  const { author, post, content, date } = req.body;
  try {
    const comment = await createComment({ author, post, content, date });
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
    res
      .status(200)
      .json({
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
