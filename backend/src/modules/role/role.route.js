import { Router } from "express";
import { roleController } from "./role.controller.js";
import { createRoleSchema, roleIdParamsSchema, updateRoleSchema } from "./role.schema.js";
import { validate } from "../../shared/middlewares/validate.js";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

// * /api/permissions — danh mục permission cố định (để UI chọn khi tạo / sửa role).
export const permissionRoutes = Router();
permissionRoutes.get(
  "/",
  authenticate,
  authorize(PERMISSIONS.ROLE_READ),
  roleController.listPermissions,
);

// * /api/roles — CRUD role động.
export const roleRoutes = Router();
roleRoutes.use(authenticate);

roleRoutes.get("/", authorize(PERMISSIONS.ROLE_READ), roleController.list);
roleRoutes.get(
  "/:id",
  authorize(PERMISSIONS.ROLE_READ),
  validate({ params: roleIdParamsSchema }),
  roleController.getById,
);
roleRoutes.post(
  "/",
  authorize(PERMISSIONS.ROLE_CREATE),
  validate({ body: createRoleSchema }),
  roleController.create,
);
roleRoutes.patch(
  "/:id",
  authorize(PERMISSIONS.ROLE_UPDATE),
  validate({ params: roleIdParamsSchema, body: updateRoleSchema }),
  roleController.update,
);
roleRoutes.delete(
  "/:id",
  authorize(PERMISSIONS.ROLE_DELETE),
  validate({ params: roleIdParamsSchema }),
  roleController.remove,
);
