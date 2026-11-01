import { PERMISSIONS } from "./permissions.js";

// * Role hệ thống: tạo bởi npm run db:seed, không đổi tên / không xoá được.
// * Role khác do người dùng tạo qua API /api/roles.
export const SYSTEM_ROLES = Object.freeze({
  ADMIN: "admin",
  MEMBER: "member", // * role mặc định khi đăng ký
});

// * Giá trị seed ban đầu (chỉ dùng khi role chưa tồn tại — sau đó permission chỉnh qua API).
export const SYSTEM_ROLE_DEFAULTS = Object.freeze([
  {
    name: SYSTEM_ROLES.ADMIN,
    description: "Quản trị viên",
    level: 50,
    permissions: Object.values(PERMISSIONS),
  },
  {
    name: SYSTEM_ROLES.MEMBER,
    description: "Thành viên (mặc định khi đăng ký)",
    level: 1,
    permissions: [],
  },
]);

// * Level của role: số nguyên, lớn hơn = cấp cao hơn. superAdmin coi như vô hạn.
export const ROLE_LEVEL_MIN = 1;
export const ROLE_LEVEL_MAX = 1000;
export const SUPER_ADMIN_LEVEL = Number.POSITIVE_INFINITY;
