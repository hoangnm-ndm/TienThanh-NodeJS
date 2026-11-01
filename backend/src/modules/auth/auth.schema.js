import { z } from "zod";

export const emailField = z
  .string({ error: "Email là bắt buộc" })
  .trim()
  .toLowerCase()
  .pipe(z.email("Email không hợp lệ").max(254, "Email tối đa 254 ký tự"));

// * bcrypt chỉ dùng 72 byte đầu → giới hạn độ dài để tránh mật khẩu dài bị cắt ngầm / DoS.
export const newPasswordField = z
  .string({ error: "Password là bắt buộc" })
  .min(6, "Password tối thiểu 6 ký tự")
  .max(64, "Password tối đa 64 ký tự")
  .regex(/[A-Za-z]/, "Password phải có ít nhất 1 chữ cái")
  .regex(/\d/, "Password phải có ít nhất 1 chữ số")
  .refine((value) => !/\s/.test(value), "Password không được chứa khoảng trắng");

// * .strict(): từ chối field lạ (vd: client tự gửi role: "admin").
export const registerSchema = z
  .object({
    email: emailField,
    password: newPasswordField,
  })
  .strict();

// * Login chỉ kiểm tra có nhập — không áp rule độ mạnh (tránh lộ rule & chặn tài khoản cũ).
export const loginSchema = z
  .object({
    email: emailField,
    password: z
      .string({ error: "Password là bắt buộc" })
      .min(1, "Password là bắt buộc")
      .max(64, "Password tối đa 64 ký tự"),
  })
  .strict();

// * Refresh token đọc từ cookie httpOnly (cookie-parser), không nhận qua body.
export const refreshTokenCookieSchema = z.object({
  refreshToken: z.jwt({ error: "Thiếu hoặc sai định dạng refresh token" }),
});
