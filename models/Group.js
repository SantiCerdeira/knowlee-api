import mongoose from "mongoose";
import { GroupPost } from "./GroupPost.js";

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
  },
  image: {
    type: String,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
  ],
  admins: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  ],
  date: {
    type: Date,
    required: true,
  },
});

const Group = mongoose.model("groups", groupSchema);

const createGroup = async (groupData) => {
  const { name, description, image, members, posts, admins, date } = groupData;
  const group = new Group({
    name,
    description,
    image,
    members,
    posts,
    admins,
    date,
  });
  return await group.save();
};

const checkIfGroupNameExists = async (name) => {
  try {
    const group = await Group.findOne({ name });
    if (group) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    throw new Error(error);
  }
};

const getGroups = async () => {
  try {
    const groups = await Group.find().sort({ name: 1 });
    return groups;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupById = async (groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId });
    return group;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupMembers = async (groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId }).populate({
      path: "members",
      select: "-password",
    });
    return group.members;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteGroupById = async (groupId) => {
  try {
    const posts = await GroupPost.find({ group: groupId });
    await GroupPost.deleteMany({ group: groupId });
    const group = await Group.findByIdAndDelete(groupId);
    return group;
  } catch (error) {
    throw new Error(error);
  }
};

const getGroupAdmins = async (groupId) => {
  try {
    const group = await Group.findOne({ _id: groupId }).populate({
      path: "admins",
      select: "-password",
    });
    return group.admins;
  } catch (error) {
    throw new Error(error);
  }
};

const addMemberToGroup = async (groupId, userId) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    return updatedGroup;
  } catch (error) {
    throw new Error(error);
  }
};

const removeMemberFromGroup = async (groupId, userId) => {
  try {
    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    );
    return updatedGroup;
  } catch (error) {
    throw new Error(error);
  }
};

const updateGroupDescription = async (groupId, description) => {
  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    group.description = description;

    await group.save();

    return group;
  } catch (error) {
    throw new Error(error);
  }
};

const updateGroupProfileImage = async (groupId, imagePath) => {
  try {
    const group = await Group.findById(groupId);

    if (!group) {
      throw new Error("Grupo no encontrado");
    }

    group.image = imagePath;

    await group.save();

    return group;
  } catch (error) {
    throw new Error("Error al actualizar la imagen de perfil");
  }
};

const checkUserMembership = async (userId, groupId) => {
  try {
    const group = await Group.findById(groupId);

    return group && group.members.includes(userId);
  } catch (error) {
    console.error("Error :", error);
    return false;
  }
};

const checkUserAdminStatus = async (userId, groupId) => {
  try {
    const group = await Group.findById(groupId);

    // Check if the group exists and if the user's ID matches the admin's ID
    return group && group.admins.includes(userId);
  } catch (error) {
    console.error("Error :", error);
    return false;
  }
};

export {
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
  checkUserMembership,
  checkUserAdminStatus,
};
