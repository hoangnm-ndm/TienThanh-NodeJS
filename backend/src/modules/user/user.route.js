import { Router } from "express";
import { userController } from "./user.controller.js";
import { assignRolesSchema, userIdParamsSchema } from "./user.schema.js";
import { validate } from "../../shared/middlewares/validate.js";
import { authenticate } from "../../shared/middlewares/authenticate.js";
import { authorize } from "../../shared/middlewares/authorize.js";
import { PERMISSIONS } from "../../shared/constants/permissions.js";

export const userRoutes = Router();

// * Mọi route quản lý user đều cần đăng nhập.
userRoutes.use(authenticate);

userRoutes.put(
  "/:id/roles",
  authorize(PERMISSIONS.USER_ASSIGN_ROLE),
  validate({ params: userIdParamsSchema, body: assignRolesSchema }),
  userController.assignRoles,
);

userRoutes.patch(
  "/:id/block",
  authorize(PERMISSIONS.USER_BLOCK),
  validate({ params: userIdParamsSchema }),
  userController.block,
);

userRoutes.patch(
  "/:id/unblock",
  authorize(PERMISSIONS.USER_BLOCK),
  validate({ params: userIdParamsSchema }),
  userController.unblock,
);
