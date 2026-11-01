import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";
// * Đăng ký model Role trước để populate("roles") luôn chạy được.
import "../role/role.model.js";

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
    // * 1 user nhiều role; quyền thực tế = hợp permission của các role.
    roles: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
      default: [],
      index: true,
    },
    // * Chủ hệ thống: bỏ qua mọi kiểm tra permission, không nằm trong bảng roles.
    isSuperAdmin: {
      type: Boolean,
      default: false,
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

// * Chỉ cho phép 1 superAdmin: unique index chỉ áp lên document có isSuperAdmin = true.
userSchema.index(
  { isSuperAdmin: 1 },
  { unique: true, partialFilterExpression: { isSuperAdmin: true } },
);

export const User = mongoose.model("User", userSchema);
