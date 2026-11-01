import { User } from "./user.model.js";
import { toPublicUser } from "./user.mapper.js";
import { ACTIVE_ROLE, Role, ROLE_ACCESS_POPULATE } from "../role/role.model.js";
import { sessionService } from "../session/session.service.js";
import { httpErrors } from "../../shared/errors/httpErrors.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import {
  assertCanGrant,
  assertLevelBelow,
  buildAccessContext,
} from "../../shared/utils/accessControl.js";

// * actor = req.user ({ id, email, access }) — người thực hiện thao tác.

function assertNotSelf(actor, targetId, action) {
  if (actor.id === String(targetId))
    throw httpErrors.forbidden(
      `Không thể tự ${action} chính mình`,
      ERROR_CODES.CANNOT_MODIFY_SELF,
    );
}

async function findTargetOrThrow(targetId) {
  const target = await User.findById(targetId).populate(ROLE_ACCESS_POPULATE);
  if (!target)
    throw httpErrors.notFound("Không tìm thấy người dùng", ERROR_CODES.USER_NOT_FOUND);
  return target;
}

// * Chỉ tác động lên người có cấp thấp hơn hẳn → superAdmin (cấp vô hạn) không ai tác động được.
function assertCanManage(actor, target) {
  assertLevelBelow(
    actor.access,
    buildAccessContext(target).level,
    "Chỉ được thao tác với người dùng có cấp thấp hơn bạn",
  );
}

// * Ghi có điều kiện: roles của target chưa đổi kể từ lúc kiểm tra quyền (chặn race).
async function updateIfRolesUnchanged(target, update) {
  const originalRoleIds = target.populated("roles") ?? [];
  const updated = await User.findOneAndUpdate(
    { _id: target._id, isSuperAdmin: false, roles: originalRoleIds },
    update,
    { returnDocument: "after" },
  ).populate(ROLE_ACCESS_POPULATE);
  if (!updated) throw httpErrors.conflict("Người dùng vừa thay đổi, vui lòng thử lại");
  return updated;
}

const sameIdSet = (a, b) =>
  a.length === b.length && a.every((id) => b.includes(id));

export const userService = {
  assignRoles: async (actor, targetId, roleIds) => {
    assertNotSelf(actor, targetId, "gán role cho");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);

    // * Role đã xoá mềm coi như không tồn tại.
    const roles = await Role.find({ _id: { $in: roleIds }, ...ACTIVE_ROLE });
    if (roles.length !== roleIds.length) {
      const found = new Set(roles.map((role) => String(role._id)));
      throw httpErrors.notFound(
        `Không tìm thấy role: ${roleIds.filter((id) => !found.has(id)).join(", ")}`,
        ERROR_CODES.ROLE_NOT_FOUND,
      );
    }

    // * Chỉ gán được role có level thấp hơn mình.
    for (const role of roles)
      assertLevelBelow(
        actor.access,
        role.level,
        `Không thể gán role "${role.name}": level phải thấp hơn level của bạn`,
        ERROR_CODES.ROLE_LEVEL_NOT_ALLOWED,
      );

    const currentIds = target.roles.map((role) => String(role._id));
    if (sameIdSet(currentIds, roleIds))
      return { user: toPublicUser(target), changed: false };

    // * Role mới thêm không được mang permission mà mình không có (chống cấp quyền vượt mình).
    assertCanGrant(
      actor.access,
      roles.filter((role) => !currentIds.includes(String(role._id))).flatMap((role) => role.permissions),
    );

    const updated = await updateIfRolesUnchanged(target, { roles: roleIds });
    return { user: toPublicUser(updated), changed: true };
  },

  block: async (actor, targetId) => {
    assertNotSelf(actor, targetId, "khoá");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);
    if (target.isBlocked) return { user: toPublicUser(target), changed: false };

    const updated = await updateIfRolesUnchanged(target, { isBlocked: new Date() });
    // * Thu hồi mọi phiên → không refresh được nữa; access token còn hạn cũng bị authenticate chặn (403).
    await sessionService.revokeAllByUser(target._id);
    return { user: toPublicUser(updated), changed: true };
  },

  unblock: async (actor, targetId) => {
    assertNotSelf(actor, targetId, "mở khoá");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);
    if (!target.isBlocked) return { user: toPublicUser(target), changed: false };

    const updated = await updateIfRolesUnchanged(target, { isBlocked: null });
    return { user: toPublicUser(updated), changed: true };
  },
};
