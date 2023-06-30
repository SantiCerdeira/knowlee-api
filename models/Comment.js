import mongoose from "mongoose";

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
  const comment = new Comment({ author, post, content, date });
  return comment.save();
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
