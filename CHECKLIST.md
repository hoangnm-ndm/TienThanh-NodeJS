# CHECKLIST — TienThanh

Cập nhật: 2026-11-01

## Đang làm

- Phân quyền đổi role + block / unblock user, seed superAdmin (vừa xong, chờ review & push).

## Đã xong

- [x] Day 01: cấu trúc source Node.js theo module
- [x] Day 03: errorHandler, validate middleware
- [x] Auth: tách logic sang service, utils dùng chung (jwt, hash, authCookies, response, httpErrors)
- [x] Auth: login / logout / refresh token bằng cookie httpOnly, session lưu DB có rotation + phát hiện token dùng lại
- [x] Auth: validation đầy đủ (register, login, cookie refresh token)
- [x] Middleware `authenticate` (cookie + fallback Bearer) và `checkRole`
- [x] Sửa lỗi: notFoundError trả 404, product list gửi response 2 lần, post model `userId`
- [x] Monorepo npm workspaces + `concurrently`, script chung ở gốc, `scripts/env-sync.mjs`
- [x] Frontend React + Vite, proxy `/api` → backend
- [x] Gỡ `backend/.env` khỏi git, `.gitignore` gốc
- [x] Docs dev (`docs/01`–`07`), README, CLAUDE.md, CHECKLIST.md
- [x] Phân quyền: superAdmin đổi role member ↔ admin (trừ chính mình), admin+ block / unblock người cấp thấp hơn, khoá thì thu hồi mọi session
- [x] Chỉ 1 superAdmin: API không gán được + unique index riêng phần ở DB
- [x] `npm run db:seed` (khung `backend/src/seeds/`), seed superAdmin từ `SEED_SUPER_ADMIN_*`

## Tiếp theo

- [ ] **Bảo mật**: đổi mật khẩu MongoDB Atlas. `.env` cũ (có `DB_URI`) vẫn nằm trong lịch sử git đã push.
- [ ] Gắn `authenticate` / `checkRole` cho route cần bảo vệ (vd `POST /api/products`)
- [ ] Quản lý thiết bị: `listByUser` (đã có `revokeAllByUser`) trong `session.service.js` + API
- [ ] API danh sách / chi tiết user cho admin; chuyển giao superAdmin (cần transaction); audit log khoá / đổi role
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
- Phân quyền theo cấp role, chỉ tác động lên cấp thấp hơn, 1 superAdmin, seed bằng env ([ADR-003](docs/07-quyet-dinh/ADR-003-phan-quyen-role-va-superadmin-duy-nhat.md))
