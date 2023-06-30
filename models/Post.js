import mongoose from "mongoose";
import { Comment } from "./Comment.js";

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 6,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  date: {
    type: Date,
    required: true,
  },
  fileName: {
    type: String,
  },
  name: {
    type: String,
  },
  lastName: {
    type: String,
  },
  premium: {
    type: Boolean,
    default: false,
    required: true,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
  ],
  likes: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
    },
  ],
  ratings: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
  ],
});

const Post = mongoose.model("posts", postSchema);

const createPost = async (postData) => {
  const { title, content, author, date, fileName, name, lastName, premium } =
    postData;
  const post = new Post({
    title,
    content,
    author,
    date,
    fileName,
    name,
    lastName,
    premium,
  });
  return post.save();
};

const getPostsByUserId = async (userId) => {
  try {
    const posts = await Post.find({ author: userId }).sort({ date: -1 });

    return posts;
  } catch (error) {
    throw new Error(error);
  }
};

const getPosts = async () => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return posts;
  } catch (error) {
    throw new Error(error);
  }
};

const deletePostById = async (postId) => {
  try {
    const comments = await Comment.find({ post: postId });
    await Comment.deleteMany({ post: postId });
    const post = await Post.findByIdAndDelete(postId);
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const likePost = async (postId, userId) => {
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: { userId: userId } } },
      { new: true }
    );
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const unlikePost = async (postId, userId) => {
  try {
    const post = await Post.findByIdAndUpdate(
      postId,
      { $pull: { likes: { userId: userId } } },
      { new: true }
    );
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const getPostById = async (id) => {
  try {
    const post = await Post.findOne({ _id: id }).populate("author");
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const ratePost = async (postId, userId, rating) => {
  try {
    const post = await Post.findById(postId);

    const existingRating = post.ratings.find(
      (r) => r.userId.toString() === userId.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
    } else {
      post.ratings.push({
        userId: userId,
        rating: rating,
      });
    }

    await post.save();
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const deletePostRating = async (postId, userId) => {
  try {
    const post = await Post.findById(postId);

    const ratingIndex = post.ratings.findIndex(
      (r) => r.userId.toString() === userId.toString()
    );

    if (ratingIndex !== -1) {
      post.ratings.splice(ratingIndex, 1);
      await post.save();
    }

    return post;
  } catch (error) {
    throw new Error(error);
  }
};

export {
  createPost,
  getPostsByUserId,
  getPosts,
  deletePostById,
  likePost,
  unlikePost,
  getPostById,
  ratePost,
  deletePostRating,
  Post,
};
