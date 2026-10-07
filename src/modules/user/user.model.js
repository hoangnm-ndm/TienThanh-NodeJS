import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
  },
  { timestamps: true, versionKey: false },
);

export const User = mongoose.model("User", userSchema);
