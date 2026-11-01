import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { envConfig } from "../../config/envConfig.js";

// * Access token: payload { sub: userId, role } — sống ngắn, gửi kèm mọi request.
export function signAccessToken({ userId, role }) {
  return jwt.sign({ role }, envConfig.JWT_ACCESS_SECRET, {
    subject: String(userId),
    expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN,
  });
}

// * Refresh token: payload { sub: userId, sid: sessionId } — jti ngẫu nhiên để mỗi lần cấp là duy nhất.
export function signRefreshToken({ userId, sessionId }) {
  return jwt.sign({ sid: String(sessionId) }, envConfig.JWT_REFRESH_SECRET, {
    subject: String(userId),
    expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
    jwtid: crypto.randomUUID(),
  });
}

// * verify* ném TokenExpiredError / JsonWebTokenError — errorHandler đã chuẩn hoá thành 401.
export function verifyAccessToken(token) {
  return jwt.verify(token, envConfig.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, envConfig.JWT_REFRESH_SECRET);
}
