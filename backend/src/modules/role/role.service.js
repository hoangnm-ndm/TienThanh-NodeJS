import { ACTIVE_ROLE, Role } from "./role.model.js";
import { User } from "../user/user.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { httpErrors } from "../../shared/errors/httpErrors.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import { PERMISSION_CATALOG } from "../../shared/constants/permissions.js";
import { SYSTEM_ROLES } from "../../shared/constants/roles.js";
import { assertCanGrant, assertLevelBelow } from "../../shared/utils/accessControl.js";

// * actor = req.user ({ id, email, access }) — người thực hiện thao tác.

function toPublicRole(role, userCount) {
  return {
    id: String(role._id),
    name: role.name,
    description: role.description,
    level: role.level,
    permissions: [...role.permissions].sort(),
    isSystem: role.isSystem,
    ...(userCount !== undefined && { userCount }),
    deletedAt: role.deletedAt ?? null,
    deletedBy: role.deletedBy ? String(role.deletedBy) : null,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

const roleNotFound = () =>
  httpErrors.notFound("Không tìm thấy role", ERROR_CODES.ROLE_NOT_FOUND);

// * Mặc định chỉ tìm role đang hoạt động; includeDeleted cho xem / xoá / khôi phục role trong thùng rác.
async function findRoleOrThrow(roleId, { includeDeleted = false } = {}) {
  const role = await Role.findOne({ _id: roleId, ...(!includeDeleted && ACTIVE_ROLE) });
  if (!role) throw roleNotFound();
  return role;
}

// * Tên chỉ cần unique giữa các role đang hoạt động (role đã xoá mềm không giữ tên).
async function assertNameAvailable(name, exceptId) {
  const existing = await Role.exists({
    name,
    ...ACTIVE_ROLE,
    ...(exceptId && { _id: { $ne: exceptId } }),
  });
  if (existing)
    throw httpErrors.conflict("Tên role đã được role khác đang dùng", ERROR_CODES.ROLE_NAME_EXISTS);
}

// * status: active (mặc định) | deleted (thùng rác) | all.
const STATUS_FILTER = {
  active: ACTIVE_ROLE,
  deleted: { deletedAt: { $ne: null } },
  all: {},
};

const assertRoleBelow = (actor, level, action) =>
  assertLevelBelow(
    actor.access,
    level,
    `Chỉ được ${action} role có level thấp hơn level của bạn`,
    ERROR_CODES.ROLE_LEVEL_NOT_ALLOWED,
  );

async function countUsersByRole() {
  const rows = await User.aggregate([
    { $unwind: "$roles" },
    { $group: { _id: "$roles", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [String(row._id), row.count]));
}

export const roleService = {
  listPermissions: () => PERMISSION_CATALOG,

  // * Role mặc định khi đăng ký — tạo bởi npm run db:seed.
  getDefaultRole: async () => {
    const role = await Role.findOne({ name: SYSTEM_ROLES.MEMBER, ...ACTIVE_ROLE });
    if (!role)
      throw new AppError({
        statusCode: 500,
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        message: "Hệ thống chưa khởi tạo role mặc định (chạy npm run db:seed)",
      });
    return role;
  },

  list: async ({ status = "active" } = {}) => {
    const [roles, counts] = await Promise.all([
      Role.find(STATUS_FILTER[status]).sort({ level: -1, name: 1 }),
      countUsersByRole(),
    ]);
    return roles.map((role) => toPublicRole(role, counts.get(String(role._id)) ?? 0));
  },

  // * Xem được cả role đã xoá mềm (deletedAt khác null).
  getById: async (roleId) => {
    const role = await findRoleOrThrow(roleId, { includeDeleted: true });
    return toPublicRole(role, await User.countDocuments({ roles: role._id }));
  },

  create: async (actor, { name, description, level, permissions }) => {
    assertRoleBelow(actor, level, "tạo");
    assertCanGrant(actor.access, permissions);
    await assertNameAvailable(name);

    const role = await Role.create({ name, description, level, permissions });
    return toPublicRole(role, 0);
  },

  update: async (actor, roleId, body) => {
    const role = await findRoleOrThrow(roleId);
    assertRoleBelow(actor, role.level, "sửa");
    if (body.level !== undefined) assertRoleBelow(actor, body.level, "đặt");

    if (body.name !== undefined && body.name !== role.name) {
      if (role.isSystem)
        throw httpErrors.forbidden(
          "Không thể đổi tên role hệ thống",
          ERROR_CODES.SYSTEM_ROLE_PROTECTED,
        );
      await assertNameAvailable(body.name, role._id);
    }

    // * Chỉ kiểm tra permission THÊM MỚI; bớt permission (kể cả cái mình không có) thì được.
    if (body.permissions !== undefined) {
      const current = new Set(role.permissions);
      assertCanGrant(actor.access, body.permissions.filter((p) => !current.has(p)));
    }

    // * Có điều kiện level cũ + chưa bị xoá → không ghi đè nếu role vừa bị đổi / xoá.
    const updated = await Role.findOneAndUpdate({ _id: role._id, level: role.level, ...ACTIVE_ROLE }, body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!updated) throw httpErrors.conflict("Role vừa thay đổi, vui lòng thử lại");
    return toPublicRole(updated, await User.countDocuments({ roles: role._id }));
  },

  // * Xoá mềm: chuyển vào thùng rác, khôi phục được. Đã xoá rồi → trả về, không lỗi (idempotent).
  remove: async (actor, roleId) => {
    const role = await findRoleOrThrow(roleId, { includeDeleted: true });
    if (role.deletedAt) return { role: toPublicRole(role, 0), changed: false };
    if (role.isSystem)
      throw httpErrors.forbidden("Không thể xoá role hệ thống", ERROR_CODES.SYSTEM_ROLE_PROTECTED);
    assertRoleBelow(actor, role.level, "xoá");

    const userCount = await User.countDocuments({ roles: role._id });
    if (userCount > 0)
      throw httpErrors.conflict(
        `Role đang được gán cho ${userCount} người dùng, hãy gỡ role khỏi họ trước khi xoá`,
        ERROR_CODES.ROLE_IN_USE,
      );

    const deleted = await Role.findOneAndUpdate(
      { _id: role._id, level: role.level, ...ACTIVE_ROLE },
      { deletedAt: new Date(), deletedBy: actor.id },
      { returnDocument: "after" },
    );
    if (!deleted) throw httpErrors.conflict("Role vừa thay đổi, vui lòng thử lại");

    // * Phòng race: có người vừa được gán role này giữa lúc đếm và lúc xoá → gỡ ra,
    //   giữ bất biến "role đã xoá không còn gán cho ai" (khôi phục không tự trả quyền cho ai).
    await User.updateMany({ roles: role._id }, { $pull: { roles: role._id } });
    return { role: toPublicRole(deleted, 0), changed: true };
  },

  // * Khôi phục từ thùng rác. Tên đã bị role khác đang dùng → 409, hoặc truyền name mới để khôi phục kèm đổi tên.
  // * Khôi phục KHÔNG gán lại role cho user cũ — phải gán lại bằng PUT /api/users/:id/roles.
  restore: async (actor, roleId, { name } = {}) => {
    const role = await findRoleOrThrow(roleId, { includeDeleted: true });
    if (!role.deletedAt) return { role: toPublicRole(role, await User.countDocuments({ roles: role._id })), changed: false };
    assertRoleBelow(actor, role.level, "khôi phục");

    const nextName = name ?? role.name;
    await assertNameAvailable(nextName, role._id);

    // * Gỡ id role còn sót trong user (do race / sửa tay DB) để khôi phục không âm thầm trả quyền cho ai.
    await User.updateMany({ roles: role._id }, { $pull: { roles: role._id } });

    const restored = await Role.findOneAndUpdate(
      { _id: role._id, level: role.level, deletedAt: { $ne: null } },
      { deletedAt: null, deletedBy: null, name: nextName },
      { returnDocument: "after", runValidators: true },
    );
    if (!restored) throw httpErrors.conflict("Role vừa thay đổi, vui lòng thử lại");
    return { role: toPublicRole(restored, 0), changed: true };
  },
};
