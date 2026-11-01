import { Role } from "../modules/role/role.model.js";
import { SYSTEM_ROLE_DEFAULTS } from "../shared/constants/roles.js";

// * Tạo role hệ thống (admin, member) nếu chưa có.
// * Role đã tồn tại → KHÔNG ghi đè permission / level (có thể đã được chỉnh qua API), chỉ đảm bảo isSystem.
export async function seedSystemRoles() {
  // * syncIndexes: tạo index mới + bỏ index không còn trong schema (vd name_1 cũ, unique toàn cục).
  const droppedIndexes = await Role.syncIndexes();
  const created = [];

  for (const defaults of SYSTEM_ROLE_DEFAULTS) {
    const result = await Role.updateOne(
      { name: defaults.name, deletedAt: null },
      { $setOnInsert: defaults, $set: { isSystem: true } },
      { upsert: true, runValidators: true },
    );
    if (result.upsertedCount > 0) created.push(defaults.name);
  }

  const messages = [
    created.length > 0 ? `Đã tạo role hệ thống: ${created.join(", ")}` : "Role hệ thống đã đủ, không thay đổi",
  ];
  if (droppedIndexes.length > 0) messages.push(`đã bỏ index cũ: ${droppedIndexes.join(", ")}`);
  return messages.join("; ");
}
