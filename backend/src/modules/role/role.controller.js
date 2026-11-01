import { roleService } from "./role.service.js";
import { sendSuccess } from "../../shared/utils/response.js";

export const roleController = {
  listPermissions: async (req, res) =>
    sendSuccess(res, {
      message: "Lấy danh mục permission thành công",
      data: roleService.listPermissions(),
    }),

  list: async (req, res) =>
    sendSuccess(res, {
      message: "Lấy danh sách role thành công",
      data: await roleService.list(),
    }),

  getById: async (req, res) =>
    sendSuccess(res, {
      message: "Lấy role thành công",
      data: await roleService.getById(req.validated.params.id),
    }),

  create: async (req, res) =>
    sendSuccess(res, {
      statusCode: 201,
      message: "Tạo role thành công",
      data: await roleService.create(req.user, req.validated.body),
    }),

  update: async (req, res) =>
    sendSuccess(res, {
      message: "Cập nhật role thành công",
      data: await roleService.update(req.user, req.validated.params.id, req.validated.body),
    }),

  remove: async (req, res) => {
    await roleService.remove(req.user, req.validated.params.id);
    return sendSuccess(res, { message: "Xoá role thành công" });
  },
};
