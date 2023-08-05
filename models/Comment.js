import mongoose from "mongoose";
import { Post } from "./Post.js";
import { GroupPost } from "./GroupPost.js";

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "posts",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const Comment = mongoose.model("comments", commentSchema);

const createComment = async (commentData) => {
  const { author, post, content, date } = commentData;

  try {
    const postWithData = await Post.findOne({ _id: post });
    if (postWithData) {
      const comment = new Comment({ author, post, content, date });
      await comment.save();
      return { comment, postWithData };
    }

    const groupPostWithData = await GroupPost.findOne({ _id: post });
    if (groupPostWithData) {
      const comment = new Comment({ author, post, content, date });
      await comment.save();
      return { comment, postWithData: groupPostWithData };
    }

    throw new Error("No se encontró el posteo");
  } catch (error) {
    console.error("Error creando comentario:", error);
    throw error;
  }
};

const getPostComments = async (postId) => {
  return Comment.find({ post: postId }).populate("author").sort({ date: -1 });
};

const deleteCommentById = async (commentId) => {
  try {
    const comment = await Comment.findByIdAndDelete(commentId);
    return comment;
  } catch (error) {
    throw new Error(error);
  }
};

export { createComment, getPostComments, deleteCommentById, Comment };
