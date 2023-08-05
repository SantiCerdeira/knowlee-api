import bcrypt from "bcrypt";
import mongoose from "mongoose";
import crypto from "crypto";
import { Post } from "./Post.js";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  rol: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
  },
  description: {
    type: String,
  },
  premium: {
    type: Boolean,
    default: false,
    required: true,
  },
  deadline: {
    type: Date,
    default: new Date(),
    required: true,
  },
  resetToken: {
    type: String,
    default: null,
    required: false,
  },
  resetTokenExpiration: {
    type: Date,
    default: null,
    required: false,
  },
  coffeeLink: {
    type: String,
    default: null,
    required: false,
  },
  paypalLink: {
    type: String,
    default: null,
    required: false,
  },
  mercadoPagoLink: {
    type: String,
    default: null,
    required: false,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
  favoritePosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
  followers: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  following: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
});

const User = mongoose.model("users", userSchema);

const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

const generateResetToken = () => {
  const token = crypto.randomBytes(20).toString("hex");
  return token;
};

const createUser = async (userData) => {
  const rol = 2;
  const profileImage =
    "https://knowleeimages.s3.sa-east-1.amazonaws.com/default-user-image.png";
  const { name, lastName, userName, date, email, password } = userData;
  const hashedPassword = await generateHashedPassword(password);
  const user = new User({
    name,
    lastName,
    userName,
    date,
    rol,
    email,
    password: hashedPassword,
    profileImage,
  });
  return user.save();
};

const checkIfUserExists = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const checkIfUserExistsByUsername = async (userName) => {
  try {
    const user = await User.findOne({ userName });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const findUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const findUserById = async (id) => {
  try {
    const user = await User.findOne({ _id: id }).select("-password");
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

const getUsers = async () => {
  try {
    const users = await User.find().select("-password");
    return users;
  } catch (error) {
    throw new Error(error);
  }
};

const findUserByEmailAndPassword = async (email, password) => {
  const user = await findUserByEmail(email);
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    }
  }
  return null;
};

const updateUserProfileImage = async (userId, imagePath) => {
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.profileImage = imagePath;

    await user.save();

    return user;
  } catch (error) {
    throw new Error("Error al actualizar la imagen de perfil");
  }
};

const updateUserDescription = async (userId, description) => {
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.description = description;

    await user.save();

    return user;
  } catch (error) {
    console.log(error);
  }
};

const followUser = async (followerId, followingId) => {
  try {
    const follower = await User.findByIdAndUpdate(
      followerId,
      { $addToSet: { following: { userId: followingId } } },
      { new: true }
    ).select("-password");

    const following = await User.findByIdAndUpdate(
      followingId,
      { $addToSet: { followers: { userId: followerId } } },
      { new: true }
    ).select("-password");

    return { follower, following };
  } catch (error) {
    throw new Error(error);
  }
};

const unfollowUser = async (followerId, followingId) => {
  try {
    const follower = await User.findByIdAndUpdate(
      followerId,
      { $pull: { following: { userId: followingId } } },
      { new: true }
    ).select("-password");

    const following = await User.findByIdAndUpdate(
      followingId,
      { $pull: { followers: { userId: followerId } } },
      { new: true }
    ).select("-password");

    return { follower, following };
  } catch (error) {
    throw new Error(error);
  }
};

const getUserFollowers = async (userId) => {
  try {
    const user = await findUserById(userId);
    const followerUserIds = user.followers.map((follower) =>
      follower.userId.toString()
    );
    return followerUserIds;
  } catch (error) {
    throw new Error("Error al obtener los seguidores");
  }
};

const getUserFollowing = async (userId) => {
  try {
    const user = await findUserById(userId);
    const followingUserIds = user.following.map((following) =>
      following.userId.toString()
    );
    return followingUserIds;
  } catch (error) {
    throw new Error("Error al obtener los seguidos");
  }
};

const buyUserPremium = async (userId) => {
  try {
    const user = await findUserById(userId);
    user.premium = true;

    const currentDate = new Date();
    const expirationDate = new Date();
    expirationDate.setMonth(currentDate.getMonth() + 1);

    user.deadline = expirationDate;
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error al comprar premium");
  }
};

const buyUserPremiumOneYear = async (userId) => {
  try {
    const user = await findUserById(userId);
    user.premium = true;

    const currentDate = new Date();
    const existingDeadline = user.deadline;

    if (existingDeadline && existingDeadline > currentDate) {
      existingDeadline.setFullYear(existingDeadline.getFullYear() + 1);
      user.deadline = existingDeadline;
    } else {
      const expirationDate = new Date();
      expirationDate.setFullYear(currentDate.getFullYear() + 1);
      user.deadline = expirationDate;
    }

    user.markModified("deadline");

    await user.save();
    console.log("final" + user.deadline);
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error al comprar premium");
  }
};

const cancelUserPremium = async (userId) => {
  try {
    const user = await findUserById(userId);
    user.premium = false;
    user.deadline = new Date("1970-01-01");
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error canceling premium");
  }
};

const schedulePremiumExpirationCheck = () => {
  setInterval(async () => {
    try {
      const currentDate = new Date();

      const expiredUsers = await User.find({
        premium: true,
        premiumExpirationDate: { $lte: currentDate },
      });

      await Promise.all(
        expiredUsers.map(async (user) => {
          user.premium = false;
          user.deadline = new Date("1970-01-01");
          await user.save();
        })
      );

      console.log(`Se completó la verificación.`);
    } catch (error) {
      console.error("Ocurrió un error al verificar la suscripción:", error);
    }
  }, 24 * 60 * 60 * 1000);
};

const setResetToken = async (email, resetToken) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
  } catch (error) {
    throw new Error("Error guardando el token de reseteo.");
  }
};

const getUserByResetToken = async (resetToken) => {
  try {
    const user = await User.findOne({ resetToken });

    if (!user) {
      throw new Error("Token inválido.");
    }

    if (user.resetTokenExpiration && user.resetTokenExpiration < Date.now()) {
      throw new Error("El token ha expirado.");
    }

    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error al buscar el usuario por el token de reseteo.");
  }
};

const changeUserPassword = async (userId, newPassword) => {
  try {
    const user = await findUserById(userId);

    const newPasswordHash = await generateHashedPassword(newPassword);

    user.password = newPasswordHash;
    await user.save();

    return user;
  } catch (error) {
    throw new Error("Error al cambiar la contraseña");
  }
};

const setDonationLinks = async (userId, links) => {
  try {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    user.coffeeLink = links.coffeeLink;
    user.paypalLink = links.paypalLink;
    user.mercadoPagoLink = links.mercadoPagoLink;

    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error guardando los links");
  }
};

const savePostAsFavorite = async (userId, postId) => {
  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (!post) {
      throw new Error("Post no encontrado");
    }

    user.favoritePosts.push(postId);

    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw new Error("Error guardando el post como favorito");
  }
};

const removePostFromFavorites = async (userId, postId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const postIndex = user.favoritePosts.indexOf(postId);
    console.log(user.favoritePosts);
    if (postIndex === -1) {
      throw new Error("La publicación no está guardada en favoritos");
    }

    user.favoritePosts.splice(postIndex, 1);
    await user.save();
    return user;
  } catch (error) {
    console.error("Error al quitar la publicación de favoritos:", error);
    throw new Error("Error al quitar la publicación de favoritos");
  }
};

export {
  generateHashedPassword,
  generateResetToken,
  createUser,
  checkIfUserExists,
  checkIfUserExistsByUsername,
  findUserByEmail,
  findUserById,
  getUsers,
  findUserByEmailAndPassword,
  updateUserProfileImage,
  updateUserDescription,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  buyUserPremium,
  buyUserPremiumOneYear,
  cancelUserPremium,
  setResetToken,
  getUserByResetToken,
  changeUserPassword,
  setDonationLinks,
  schedulePremiumExpirationCheck,
  savePostAsFavorite,
  removePostFromFavorites,
  User,
};
