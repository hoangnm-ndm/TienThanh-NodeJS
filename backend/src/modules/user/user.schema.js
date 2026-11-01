import { z } from "zod";
import { ASSIGNABLE_ROLES } from "../../shared/constants/roles.js";

export const userIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Id người dùng không hợp lệ"),
});

// * Không cho gán superAdmin: hệ thống chỉ có đúng 1 superAdmin.
export const updateRoleSchema = z
  .object({
    role: z.enum(ASSIGNABLE_ROLES, {
      error: `Role chỉ được là: ${ASSIGNABLE_ROLES.join(", ")}`,
    }),
  })
  .strict();
