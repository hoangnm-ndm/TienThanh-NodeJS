import mongoose from "mongoose";
import { schemaOptions } from "../../config/schemaOptions.js";
import { PERMISSION_KEYS } from "../../shared/constants/permissions.js";
import { ROLE_LEVEL_MAX, ROLE_LEVEL_MIN } from "../../shared/constants/roles.js";

const roleSchema = new mongoose.Schema(
  {
    // * Slug dùng làm khoá (vd "content-editor"), unique trong các role chưa xoá (index bên dưới).
    name: {
      type: String,
      required: true,
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
    // * Xoá mềm: khác null = đã xoá (vào thùng rác), khôi phục được.
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  schemaOptions,
);

// * Tên chỉ unique giữa các role CHƯA xoá → tên của role đã xoá mềm được dùng lại.
// * (Thiếu field deletedAt cũng tính là null → role cũ vẫn được kiểm tra.)
roleSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null }, name: "name_active_unique" },
);

export const Role = mongoose.model("Role", roleSchema);

// * Điều kiện "role đang hoạt động" — mọi truy vấn role nghiệp vụ phải dùng.
export const ACTIVE_ROLE = Object.freeze({ deletedAt: null });

// * Populate roles của user để tính quyền: bỏ qua role đã xoá mềm.
// * Không freeze: Mongoose có thể cast / gán vào object option khi populate.
export const ROLE_ACCESS_POPULATE = {
  path: "roles",
  select: "name level permissions",
  match: { ...ACTIVE_ROLE },
};
