import { z } from "zod";
import { User } from "../modules/user/user.model.js";
import { envConfig } from "../config/envConfig.js";
import { emailField, newPasswordField } from "../modules/auth/auth.schema.js";
import { ROLES } from "../shared/constants/roles.js";
import { hashPassword } from "../shared/utils/hash.js";

const envSchema = z.object({
  email: emailField,
  password: newPasswordField.optional(),
});

// * Tạo superAdmin duy nhất từ env (SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD).
// * - Đã có superAdmin → bỏ qua (hệ thống chỉ có 1).
// * - Email đã đăng ký → nâng user đó lên superAdmin, giữ nguyên mật khẩu.
// * - Email chưa có → tạo mới, cần SEED_SUPER_ADMIN_PASSWORD.
export async function seedSuperAdmin() {
  if (!envConfig.SEED_SUPER_ADMIN_EMAIL)
    return "Bỏ qua: chưa điền SEED_SUPER_ADMIN_EMAIL";

  const parsed = envSchema.safeParse({
    email: envConfig.SEED_SUPER_ADMIN_EMAIL,
    password: envConfig.SEED_SUPER_ADMIN_PASSWORD,
  });
  if (!parsed.success)
    throw new Error(
      `SEED_SUPER_ADMIN_* không hợp lệ: ${parsed.error.issues.map((i) => i.message).join("; ")}`,
    );
  const { email, password } = parsed.data;

  // * Đảm bảo unique index "1 superAdmin" đã tạo trước khi ghi.
  await User.init();

  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });
  if (existing)
    return existing.email === email
      ? `superAdmin ${email} đã tồn tại, không thay đổi`
      : `Bỏ qua: hệ thống đã có superAdmin khác (${existing.email})`;

  const user = await User.findOne({ email });
  if (user) {
    user.role = ROLES.SUPER_ADMIN;
    user.isBlocked = null;
    await user.save();
    return `Đã nâng ${email} lên superAdmin (giữ nguyên mật khẩu)`;
  }

  if (!password)
    throw new Error(
      `Chưa có user ${email} — cần điền SEED_SUPER_ADMIN_PASSWORD để tạo mới`,
    );

  await User.create({
    email,
    password: await hashPassword(password),
    role: ROLES.SUPER_ADMIN,
    isVerify: true,
  });
  return `Đã tạo superAdmin ${email}`;
}
