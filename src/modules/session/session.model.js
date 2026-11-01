import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";

// * Mỗi document = 1 phiên đăng nhập (1 thiết bị / trình duyệt).
// * Refresh token được rotation: mỗi lần refresh, tokenHash đổi nhưng session giữ nguyên _id
//   → sau này làm được "danh sách thiết bị đang đăng nhập", "đăng xuất thiết bị khác".
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // * SHA-256 của refresh token hiện hành — không lưu token gốc.
    tokenHash: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  schemaOptions,
);

// * TTL index: MongoDB tự xoá session khi quá expiresAt.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model("Session", sessionSchema);
