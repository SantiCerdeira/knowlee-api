import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
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
    ref: "posts",
    required: true,
  },
});

const Report = mongoose.model("reports", reportSchema);

const newReport = async (user, post, message) => {
  try {
    const report = new Report({ user, post, message });
    return report.save();
  } catch (error) {
    throw new Error(error);
  }
};

export { newReport };
