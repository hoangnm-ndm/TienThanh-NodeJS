import { z } from "zod";
import { objectIdField } from "../../shared/utils/validators.js";

export const userIdParamsSchema = z.object({
  id: objectIdField("Id người dùng không hợp lệ"),
});

// * Thay toàn bộ danh sách role của user (mảng rỗng = gỡ hết role).
export const assignRolesSchema = z
  .object({
    roleIds: z
      .array(objectIdField("Id role không hợp lệ"), { error: "roleIds phải là mảng id role" })
      .max(20, "Tối đa 20 role")
      .transform((ids) => [...new Set(ids)]),
  })
  .strict();
