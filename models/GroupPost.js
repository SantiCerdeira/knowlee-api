import mongoose from "mongoose";
import { Comment } from "./Comment.js";

const groupPostSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "groups",
    required: true,
  },
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

const GroupPost = mongoose.model("group-posts", groupPostSchema);

const createGroupPost = async (postData) => {
  const {
    group,
    title,
    content,
    author,
    date,
    fileName,
    name,
    lastName,
    premium,
  } = postData;
  const post = new GroupPost({
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
  return post.save();
};

const getGroupPostsByUserId = async (userId) => {
  try {
    const posts = await GroupPost.find({ author: userId }).sort({ date: -1 });

    return posts;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupPosts = async (groupId) => {
  try {
    const posts = await GroupPost.find({ group: groupId }).sort({ date: -1 });
    return posts;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteGroupPostById = async (postId) => {
  try {
    const comments = await Comment.find({ post: postId });
    await Comment.deleteMany({ post: postId });
    const post = await GroupPost.findByIdAndDelete(postId);
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const likeGroupPost = async (postId, userId) => {
  try {
    const post = await GroupPost.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: { userId: userId } } },
      { new: true }
    );
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const unlikeGroupPost = async (postId, userId) => {
  try {
    const post = await GroupPost.findByIdAndUpdate(
      postId,
      { $pull: { likes: { userId: userId } } },
      { new: true }
    );
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupPostById = async (id) => {
  try {
    const post = await GroupPost.findOne({ _id: id }).populate("author");
    return post;
  } catch (error) {
    throw new Error(error);
  }
};

const rateGroupPost = async (postId, userId, rating) => {
  try {
    const post = await GroupPost.findById(postId);

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

const deleteGroupPostRating = async (postId, userId) => {
  try {
    const post = await GroupPost.findById(postId);

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
  createGroupPost,
  getGroupPostsByUserId,
  getGroupPosts,
  deleteGroupPostById,
  likeGroupPost,
  unlikeGroupPost,
  getGroupPostById,
  rateGroupPost,
  deleteGroupPostRating,
  GroupPost,
};
