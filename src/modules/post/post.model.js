import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    userId: {
      type: mongoose.type.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model("Post", postSchema);
