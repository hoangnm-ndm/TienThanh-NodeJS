import { PERMISSION_KEYS } from "../constants/permissions.js";
import { SUPER_ADMIN_LEVEL } from "../constants/roles.js";
import { httpErrors } from "../errors/httpErrors.js";
import { ERROR_CODES } from "../errors/errorCodes.js";

// * user: document / object User có roles ĐÃ populate ({ _id, name, level, permissions }).
// * Trả về "access context" dùng cho mọi kiểm tra quyền.
export function buildAccessContext(user) {
  const roles = (user.roles ?? []).filter((role) => role?.name);

  if (user.isSuperAdmin)
    return {
      isSuperAdmin: true,
      roles,
      level: SUPER_ADMIN_LEVEL,
      permissions: new Set(PERMISSION_KEYS),
    };

  return {
    isSuperAdmin: false,
    roles,
    // * Cấp của user = level cao nhất trong các role; không có role → 0.
    level: Math.max(0, ...roles.map((role) => role.level)),
    permissions: new Set(roles.flatMap((role) => role.permissions)),
  };
}

export function hasPermissions(ctx, permissions) {
  return ctx.isSuperAdmin || permissions.every((p) => ctx.permissions.has(p));
}

// * Chỉ được tác động lên thứ có level thấp hơn hẳn mình (bằng level → không được).
export function assertLevelBelow(ctx, level, message, code = ERROR_CODES.TARGET_ROLE_NOT_ALLOWED) {
  if (!(ctx.level > level)) throw httpErrors.forbidden(message, code);
}

// * Chống leo thang đặc quyền: chỉ được cấp permission mà chính mình đang có.
export function assertCanGrant(ctx, permissions) {
  if (ctx.isSuperAdmin) return;
  const notOwned = [...new Set(permissions)].filter((p) => !ctx.permissions.has(p));
  if (notOwned.length > 0)
    throw httpErrors.forbidden(
      `Không thể cấp permission bạn không có: ${notOwned.join(", ")}`,
      ERROR_CODES.PERMISSION_NOT_GRANTABLE,
    );
}
