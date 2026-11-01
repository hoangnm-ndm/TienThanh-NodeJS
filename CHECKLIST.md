# CHECKLIST — TienThanh

Cập nhật: 2026-11-01

## Đang làm

- Xoá mềm role + khôi phục (vừa xong, chờ review & push).

## Đã xong

- [x] Day 01: cấu trúc source Node.js theo module
- [x] Day 03: errorHandler, validate middleware
- [x] Auth: tách logic sang service, utils dùng chung (jwt, hash, authCookies, response, httpErrors)
- [x] Auth: login / logout / refresh token bằng cookie httpOnly, session lưu DB có rotation + phát hiện token dùng lại
- [x] Auth: validation đầy đủ (register, login, cookie refresh token)
- [x] Middleware `authenticate` (cookie + fallback Bearer) và `checkRole` (đã thay bằng `authorize`)
- [x] Sửa lỗi: notFoundError trả 404, product list gửi response 2 lần, post model `userId`
- [x] Monorepo npm workspaces + `concurrently`, script chung ở gốc, `scripts/env-sync.mjs`
- [x] Frontend React + Vite, proxy `/api` → backend
- [x] Gỡ `backend/.env` khỏi git, `.gitignore` gốc
- [x] Docs dev (`docs/01`–`07`), README, CLAUDE.md, CHECKLIST.md
- [x] Phân quyền role cố định: superAdmin đổi role member ↔ admin, admin+ block / unblock người cấp thấp hơn, khoá thì thu hồi mọi session (đã thay bằng RBAC động)
- [x] Chỉ 1 superAdmin: API không gán được + unique index riêng phần ở DB
- [x] `npm run db:seed` (khung `backend/src/seeds/`), seed superAdmin từ `SEED_SUPER_ADMIN_*`
- [x] RBAC động: danh mục permission trong code, CRUD `/api/roles`, `GET /api/permissions`, `PUT /api/users/:id/roles` (nhiều role), `authorize()` thay `checkRole`
- [x] Chống leo thang đặc quyền: level + chỉ cấp permission mình có + không tự tác động; xoá role đang dùng → 409
- [x] superAdmin = cờ `isSuperAdmin` (unique index riêng phần); seed role hệ thống + migration dữ liệu `role` cũ
- [x] Xoá mềm role (`deletedAt`, `deletedBy`), `PATCH /api/roles/:id/restore` (đổi tên khi trùng), `GET /api/roles?status=active|deleted|all`; tên unique giữa role chưa xoá

## Tiếp theo

- [ ] **Bảo mật**: đổi mật khẩu MongoDB Atlas. `.env` cũ (có `DB_URI`) vẫn nằm trong lịch sử git đã push.
- [ ] **Sau khi pull**: chạy `npm run db:seed` trên DB thật (Atlas) để tạo role hệ thống, migration dữ liệu `role` cũ, bỏ index `name_1` cũ của roles
- [ ] Gắn `authenticate` / `authorize` cho route cần bảo vệ (vd `POST /api/products` → thêm permission `product:create`)
- [ ] Quản lý thiết bị: `listByUser` (đã có `revokeAllByUser`) trong `session.service.js` + API
- [ ] API danh sách / chi tiết user cho admin; chuyển giao superAdmin (cần transaction); audit log cấp quyền / khoá
- [ ] Cache role / permission khi tải lớn (hiện populate mỗi request)
- [ ] Xoá vĩnh viễn / tự dọn role trong thùng rác (nếu cần)
- [ ] Quên / đặt lại mật khẩu, xác thực email (stub trong `auth.controller.js`)
- [ ] Rate limit đăng nhập (chống brute force)
- [ ] Product: chuyển controller sang `sendSuccess` + `req.validated.body`, thêm get / update / delete
- [ ] Frontend: trang đăng nhập / đăng ký gọi `/api/auth`
- [ ] Xử lý `npm audit` (body-parser, qs — dependency gián tiếp của Express)
- [ ] Thêm test tự động

## Quyết định đã chốt

- Monorepo npm workspaces + concurrently, gốc repo là `TienThanh/` ([ADR-001](docs/07-quyet-dinh/ADR-001-monorepo-npm-workspaces.md))
- Auth: cookie httpOnly cho cả 2 token, fallback Bearer, session collection riêng + rotation, `cookie-parser` ([ADR-002](docs/07-quyet-dinh/ADR-002-cookie-auth-session-rotation.md))
- Frontend: React + Vite (JS), gọi API qua proxy cùng origin
- ~~Phân quyền theo cấp role cố định (ADR-003)~~ → thay bởi RBAC động: role trong DB, permission cố định trong code, nhiều role mỗi user, superAdmin = cờ, level + tập con permission, xoá role đang dùng → 409 ([ADR-004](docs/07-quyet-dinh/ADR-004-phan-quyen-dong-rbac.md))
- Xoá mềm role, khôi phục dùng permission `role:delete`, tên unique giữa role chưa xoá, khôi phục không gán lại cho user ([ADR-005](docs/07-quyet-dinh/ADR-005-xoa-mem-role.md))
