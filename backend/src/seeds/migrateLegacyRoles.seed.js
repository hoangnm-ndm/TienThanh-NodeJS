import { User } from "../modules/user/user.model.js";
import { Role } from "../modules/role/role.model.js";
import { SYSTEM_ROLES } from "../shared/constants/roles.js";

// * Migration 1 lần (idempotent): dữ liệu cũ dùng field role: "superAdmin" | "admin" | "member".
// * → superAdmin: isSuperAdmin = true · admin / member: roles = [role hệ thống tương ứng] · xoá field role.
// * Dùng driver gốc (User.collection) vì field "role" không còn trong schema (Mongoose sẽ bỏ qua).
export async function migrateLegacyRoles() {
  const users = User.collection;
  const legacyCount = await users.countDocuments({ role: { $exists: true } });

  // * Index cũ "1 superAdmin" trên field role → bỏ, đã thay bằng index trên isSuperAdmin.
  const hasLegacyIndex = (await users.indexes()).some((index) => index.name === "role_1");
  if (hasLegacyIndex) await users.dropIndex("role_1");

  if (legacyCount === 0)
    return hasLegacyIndex ? "Đã xoá index cũ role_1, không có dữ liệu cần chuyển" : "Không có dữ liệu role cũ";

  const roleIdByName = new Map(
    (await Role.find({ name: { $in: Object.values(SYSTEM_ROLES) } })).map((role) => [role.name, role._id]),
  );

  // * Chạy superAdmin trước: unique index isSuperAdmin chặn nếu dữ liệu cũ lỡ có > 1 superAdmin.
  const superAdmin = await users.updateMany(
    { role: "superAdmin" },
    { $set: { isSuperAdmin: true, roles: [] }, $unset: { role: "" } },
  );

  const summary = [`superAdmin: ${superAdmin.modifiedCount}`];
  for (const name of Object.values(SYSTEM_ROLES)) {
    const result = await users.updateMany(
      { role: name },
      { $set: { roles: [roleIdByName.get(name)], isSuperAdmin: false }, $unset: { role: "" } },
    );
    summary.push(`${name}: ${result.modifiedCount}`);
  }

  // * Giá trị role lạ (nếu có) → member.
  const others = await users.updateMany(
    { role: { $exists: true } },
    { $set: { roles: [roleIdByName.get(SYSTEM_ROLES.MEMBER)], isSuperAdmin: false }, $unset: { role: "" } },
  );
  if (others.modifiedCount > 0) summary.push(`khác → member: ${others.modifiedCount}`);

  return `Đã chuyển ${legacyCount} user sang roles[] (${summary.join(", ")})`;
}
