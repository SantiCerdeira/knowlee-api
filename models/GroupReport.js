import mongoose from "mongoose";

const groupReportSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group-posts",
    required: true,
  },
});

const GroupReport = mongoose.model("group-reports", groupReportSchema);

const newGroupReport = async (user, post, message) => {
  try {
    const report = new GroupReport({ user, post, message });
    return report.save();
  } catch (error) {
    throw new Error(error);
  }
};

export { newGroupReport };
