import { userService } from "./user.service.js";
import { sendSuccess } from "../../shared/utils/response.js";

// * Thao tác không đổi gì (đã khoá rồi, role giữ nguyên…) vẫn trả 200 → idempotent.
export const userController = {
  updateRole: async (req, res) => {
    const { user, changed } = await userService.updateRole(
      req.user,
      req.validated.params.id,
      req.validated.body.role,
    );
    return sendSuccess(res, {
      message: changed ? "Cập nhật role thành công" : "Role không thay đổi",
      data: user,
    });
  },

  block: async (req, res) => {
    const { user, changed } = await userService.block(
      req.user,
      req.validated.params.id,
    );
    return sendSuccess(res, {
      message: changed ? "Khoá tài khoản thành công" : "Tài khoản đã bị khoá trước đó",
      data: user,
    });
  },

  unblock: async (req, res) => {
    const { user, changed } = await userService.unblock(
      req.user,
      req.validated.params.id,
    );
    return sendSuccess(res, {
      message: changed ? "Mở khoá tài khoản thành công" : "Tài khoản không bị khoá",
      data: user,
    });
  },
};
