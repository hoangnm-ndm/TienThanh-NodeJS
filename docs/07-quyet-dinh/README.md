# 07 — Quyết định kiến trúc (ADR)

Đọc khi muốn biết vì sao dự án chọn cấu trúc / công nghệ hiện tại. Mục lục chung: [docs/README.md](../README.md)

Mỗi ADR ghi bối cảnh, quyết định, hệ quả. **Không sửa ADR cũ**: quyết định thay đổi thì thêm ADR mới ghi "thay ADR-0xx".

| ADR | Quyết định |
| --- | --- |
| [ADR-001](ADR-001-monorepo-npm-workspaces.md) | Monorepo `backend/` + `frontend/` + `docs/` với npm workspaces |
| [ADR-002](ADR-002-cookie-auth-session-rotation.md) | Auth bằng cookie httpOnly + session lưu DB có rotation |
| [ADR-003](ADR-003-phan-quyen-role-va-superadmin-duy-nhat.md) | ~~Phân quyền theo cấp role cố định, chỉ 1 superAdmin, seed bằng env~~ — đã thay bởi ADR-004 |
| [ADR-004](ADR-004-phan-quyen-dong-rbac.md) | Phân quyền động (RBAC): role trong DB, permission cố định, nhiều role mỗi user |
