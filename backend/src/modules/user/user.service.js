import { User } from "./user.model.js";
import { toPublicUser } from "./user.mapper.js";
import { sessionService } from "../session/session.service.js";
import { httpErrors } from "../../shared/errors/httpErrors.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import {
  ROLES,
  isHigherRole,
  rolesBelow,
} from "../../shared/constants/roles.js";

// * actor = req.user ({ id, email, role }) — người thực hiện thao tác.

function assertNotSelf(actor, targetId, action) {
  if (actor.id === String(targetId))
    throw httpErrors.forbidden(
      `Không thể tự ${action} chính mình`,
      ERROR_CODES.CANNOT_MODIFY_SELF,
    );
}

async function findTargetOrThrow(targetId) {
  const target = await User.findById(targetId);
  if (!target)
    throw httpErrors.notFound(
      "Không tìm thấy người dùng",
      ERROR_CODES.USER_NOT_FOUND,
    );
  return target;
}

// * Chỉ tác động lên người có cấp thấp hơn → superAdmin (cấp cao nhất) không bao giờ bị khoá.
function assertCanManage(actor, target) {
  if (!isHigherRole(actor.role, target.role))
    throw httpErrors.forbidden(
      "Chỉ được thao tác với tài khoản có cấp thấp hơn bạn",
      ERROR_CODES.TARGET_ROLE_NOT_ALLOWED,
    );
}

// * Cập nhật có điều kiện role của target vẫn thấp hơn actor (chặn race: target vừa được nâng role).
async function updateManagedUser(actor, target, update) {
  const updated = await User.findOneAndUpdate(
    { _id: target._id, role: { $in: rolesBelow(actor.role) } },
    update,
    { returnDocument: "after" },
  );
  if (!updated) {
    assertCanManage(actor, await findTargetOrThrow(target._id));
    throw httpErrors.conflict("Dữ liệu vừa thay đổi, vui lòng thử lại");
  }
  return updated;
}

export const userService = {
  // * Chỉ superAdmin (route đã checkRole); role mới chỉ admin | member (schema đã chặn superAdmin).
  updateRole: async (actor, targetId, role) => {
    if (actor.role !== ROLES.SUPER_ADMIN) throw httpErrors.forbidden();
    assertNotSelf(actor, targetId, "đổi role của");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);
    if (target.role === role) return { user: toPublicUser(target), changed: false };

    const updated = await updateManagedUser(actor, target, { role });
    return { user: toPublicUser(updated), changed: true };
  },

  block: async (actor, targetId) => {
    assertNotSelf(actor, targetId, "khoá");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);
    if (target.isBlocked) return { user: toPublicUser(target), changed: false };

    const updated = await updateManagedUser(actor, target, {
      isBlocked: new Date(),
    });
    // * Thu hồi mọi phiên → không refresh được nữa; access token còn hạn cũng bị authenticate chặn (403).
    await sessionService.revokeAllByUser(target._id);
    return { user: toPublicUser(updated), changed: true };
  },

  unblock: async (actor, targetId) => {
    assertNotSelf(actor, targetId, "mở khoá");

    const target = await findTargetOrThrow(targetId);
    assertCanManage(actor, target);
    if (!target.isBlocked) return { user: toPublicUser(target), changed: false };

    const updated = await updateManagedUser(actor, target, { isBlocked: null });
    return { user: toPublicUser(updated), changed: true };
  },
};
