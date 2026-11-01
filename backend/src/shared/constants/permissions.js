// * Danh mục permission CỐ ĐỊNH trong code: mỗi permission chỉ có nghĩa khi có code kiểm tra nó.
// * Role (dữ liệu động trong DB) chỉ được chứa permission có trong danh mục này.
// * Thêm permission: khai báo ở đây → dùng authorize(PERMISSIONS.X) ở route → cập nhật docs/05-nguoi-dung.md.
export const PERMISSIONS = Object.freeze({
  USER_BLOCK: "user:block",
  USER_ASSIGN_ROLE: "user:assign-role",
  ROLE_READ: "role:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",
});

export const PERMISSION_CATALOG = Object.freeze([
  { key: PERMISSIONS.USER_BLOCK, group: "user", description: "Khoá / mở khoá người dùng" },
  { key: PERMISSIONS.USER_ASSIGN_ROLE, group: "user", description: "Gán role cho người dùng" },
  { key: PERMISSIONS.ROLE_READ, group: "role", description: "Xem role và danh mục permission" },
  { key: PERMISSIONS.ROLE_CREATE, group: "role", description: "Tạo role" },
  { key: PERMISSIONS.ROLE_UPDATE, group: "role", description: "Sửa role, thêm / bớt permission" },
  { key: PERMISSIONS.ROLE_DELETE, group: "role", description: "Xoá mềm và khôi phục role" },
]);

export const PERMISSION_KEYS = Object.freeze(PERMISSION_CATALOG.map((p) => p.key));
