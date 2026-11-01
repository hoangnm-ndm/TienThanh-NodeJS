import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";
import { PERMISSION_KEYS } from "../../shared/constants/permissions.js";
import { ROLE_LEVEL_MAX, ROLE_LEVEL_MIN } from "../../shared/constants/roles.js";

const roleSchema = new mongoose.Schema(
  {
    // * Slug dùng làm khoá (vd "content-editor"), unique.
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "",
    },
    permissions: {
      type: [{ type: String, enum: PERMISSION_KEYS }],
      default: [],
    },
    // * Cấp bậc: chỉ người có level cao hơn hẳn mới sửa / xoá / gán role này.
    level: {
      type: Number,
      required: true,
      min: ROLE_LEVEL_MIN,
      max: ROLE_LEVEL_MAX,
    },
    // * Role hệ thống (admin, member): không đổi tên, không xoá.
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  schemaOptions,
);

export const Role = mongoose.model("Role", roleSchema);

// * Field cần populate khi tính quyền.
export const ROLE_ACCESS_FIELDS = "name level permissions";
