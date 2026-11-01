import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";
import { ROLES } from "../../shared/constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      // * Không trả password trong mọi query mặc định; cần thì .select("+password").
      select: false,
    },
    language: {
      type: String,
      enum: ["en", "vi", "jp"],
      default: "en",
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.MEMBER,
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
