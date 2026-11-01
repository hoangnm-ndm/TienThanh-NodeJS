import { z } from "zod";
import { PERMISSION_KEYS } from "../../shared/constants/permissions.js";
import { ROLE_LEVEL_MAX, ROLE_LEVEL_MIN } from "../../shared/constants/roles.js";
import { objectIdField } from "../../shared/utils/validators.js";

export const roleIdParamsSchema = z.object({
  id: objectIdField("Id role không hợp lệ"),
});

const nameField = z
  .string({ error: "Tên role là bắt buộc" })
  .trim()
  .toLowerCase()
  .min(2, "Tên role tối thiểu 2 ký tự")
  .max(50, "Tên role tối đa 50 ký tự")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Tên role chỉ gồm chữ thường, số và dấu '-' (vd: content-editor)",
  );

const descriptionField = z
  .string()
  .trim()
  .max(200, "Mô tả tối đa 200 ký tự");

const levelField = z
  .number({ error: "Level phải là số" })
  .int("Level phải là số nguyên")
  .min(ROLE_LEVEL_MIN, `Level tối thiểu ${ROLE_LEVEL_MIN}`)
  .max(ROLE_LEVEL_MAX, `Level tối đa ${ROLE_LEVEL_MAX}`);

// * Chỉ nhận permission có trong danh mục code; loại trùng lặp.
const permissionsField = z
  .array(z.enum(PERMISSION_KEYS, { error: "Permission không tồn tại" }))
  .max(PERMISSION_KEYS.length, "Danh sách permission quá dài")
  .transform((permissions) => [...new Set(permissions)]);

// * GET /api/roles?status=active|deleted|all
export const listRolesQuerySchema = z
  .object({
    status: z
      .enum(["active", "deleted", "all"], { error: "status chỉ được là: active, deleted, all" })
      .default("active"),
  })
  .strict();

// * Khôi phục kèm đổi tên (tuỳ chọn) khi tên cũ đã bị role khác dùng.
export const restoreRoleSchema = z
  .object({
    name: nameField.optional(),
  })
  .strict();

export const createRoleSchema = z
  .object({
    name: nameField,
    description: descriptionField.default(""),
    level: levelField,
    permissions: permissionsField.default([]),
  })
  .strict();

export const updateRoleSchema = z
  .object({
    name: nameField.optional(),
    description: descriptionField.optional(),
    level: levelField.optional(),
    permissions: permissionsField.optional(),
  })
  .strict()
  .refine((body) => Object.keys(body).length > 0, "Cần ít nhất 1 field để cập nhật");
