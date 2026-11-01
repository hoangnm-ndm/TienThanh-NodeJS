import mongoose from "mongoose";
import { Session } from "./session.model.js";
import { envConfig } from "../../config/envConfig.js";
import { durationToMs } from "../../shared/utils/duration.js";
import { hashToken } from "../../shared/utils/hash.js";

function nextExpiresAt() {
  return new Date(Date.now() + durationToMs(envConfig.JWT_REFRESH_EXPIRES_IN));
}

export const sessionService = {
  // * Tạo _id trước để nhúng vào refresh token (sid) rồi mới lưu hash của chính token đó.
  newId: () => new mongoose.Types.ObjectId(),

  create: ({ sessionId, userId, refreshToken, userAgent, ip }) =>
    Session.create({
      _id: sessionId,
      userId,
      tokenHash: hashToken(refreshToken),
      userAgent,
      ip,
      expiresAt: nextExpiresAt(),
    }),

  findActiveById: (sessionId) =>
    mongoose.isValidObjectId(sessionId)
      ? Session.findOne({ _id: sessionId, revokedAt: null, expiresAt: { $gt: new Date() } })
      : null,

  // * Đổi token có điều kiện tokenHash cũ → 2 request refresh song song chỉ 1 cái thắng.
  rotate: ({ sessionId, oldToken, newToken, userAgent, ip }) =>
    Session.findOneAndUpdate(
      { _id: sessionId, tokenHash: hashToken(oldToken), revokedAt: null },
      {
        tokenHash: hashToken(newToken),
        lastUsedAt: new Date(),
        expiresAt: nextExpiresAt(),
        userAgent,
        ip,
      },
      { returnDocument: "after" },
    ),

  revoke: (sessionId) =>
    mongoose.isValidObjectId(sessionId)
      ? Session.updateOne({ _id: sessionId, revokedAt: null }, { revokedAt: new Date() })
      : null,

  // * Thu hồi mọi phiên của user (vd: khi bị khoá) → mọi thiết bị phải đăng nhập lại.
  revokeAllByUser: (userId) =>
    Session.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() }),

  // TODO (mở rộng quản lý thiết bị): listByUser(userId), tham số exceptSessionId cho revokeAllByUser.
};
