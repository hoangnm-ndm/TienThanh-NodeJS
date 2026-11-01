import { httpErrors } from "../errors/httpErrors.js";
import { ROLES } from "../constants/roles.js";

export { ROLES };

// * Phân quyền theo role, luôn đặt SAU authenticate:
//   router.delete("/:id", authenticate, checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN), controller.remove)
export function checkRole(...allowedRoles) {
  if (allowedRoles.length === 0) throw new Error("checkRole cần ít nhất 1 role");

  return (req, res, next) => {
    if (!req.user) throw httpErrors.unauthorized("Bạn chưa đăng nhập");
    if (!allowedRoles.includes(req.user.role)) throw httpErrors.forbidden();
    next();
  };
}
