import { httpErrors } from "../errors/httpErrors.js";
import { hasPermissions } from "../utils/accessControl.js";

// * Phân quyền theo permission, luôn đặt SAU authenticate:
//   router.patch("/:id/block", authenticate, authorize(PERMISSIONS.USER_BLOCK), controller.block)
// * Truyền nhiều permission → phải có ĐỦ tất cả. superAdmin luôn qua.
export function authorize(...permissions) {
  if (permissions.length === 0) throw new Error("authorize cần ít nhất 1 permission");

  return (req, res, next) => {
    if (!req.user) throw httpErrors.unauthorized("Bạn chưa đăng nhập");
    if (!hasPermissions(req.user.access, permissions)) throw httpErrors.forbidden();
    next();
  };
}
