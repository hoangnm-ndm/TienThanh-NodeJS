import { Router } from "express";
import { userController } from "./user.controller.js";
import { userIdParamsSchema, updateRoleSchema } from "./user.schema.js";
import { validate } from "../../shared/middlewares/validate.js";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { checkRole } from "../../shared/middlewares/checkRole.js";
import { ROLES } from "../../shared/constants/roles.js";

export const userRoutes = Router();

// * Mọi route quản lý user đều cần đăng nhập.
userRoutes.use(authenticate);

userRoutes.patch(
  "/:id/role",
  checkRole(ROLES.SUPER_ADMIN),
  validate({ params: userIdParamsSchema, body: updateRoleSchema }),
  userController.updateRole,
);

userRoutes.patch(
  "/:id/block",
  checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate({ params: userIdParamsSchema }),
  userController.block,
);

userRoutes.patch(
  "/:id/unblock",
  checkRole(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validate({ params: userIdParamsSchema }),
  userController.unblock,
);
