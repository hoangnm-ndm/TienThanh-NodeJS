import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { envConfig } from "../../config/envConfig.js";

// * Mật khẩu: bcrypt (chậm có chủ đích, chống brute force khi lộ DB).
export function hashPassword(plain) {
  return bcrypt.hash(plain, envConfig.BCRYPT_SALT_ROUNDS);
}

export function comparePassword(plain, hashed) {
  return bcrypt.compare(plain, hashed);
}

// * Token (refresh token…): SHA-256 là đủ vì token đã ngẫu nhiên & dài; lưu hash thay vì token gốc.
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
