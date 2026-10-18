import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";

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
    language: {
      type: String,
      enum: ["en", "vi", "jp"],
      default: "en",
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "member"],
      default: "member",
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
    // * isBlocked = ~!isActive
    isBlocked: {
      type: Date,
      default: null,
    },
  },
  schemaOptions,
);

export const User = mongoose.model("User", userSchema);
