# CHECKLIST — TienThanh

Cập nhật: 2026-11-01

## Đang làm

- Chuyển repo sang monorepo `backend/` + `frontend/` + `docs/` (vừa xong, chờ review & push).

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
- [x] Docs dev (`docs/01`–`06`), README, CLAUDE.md, CHECKLIST.md

## Tiếp theo

- [ ] **Bảo mật**: đổi mật khẩu MongoDB Atlas. `.env` cũ (có `DB_URI`) vẫn nằm trong lịch sử git đã push.
- [ ] Gắn `authenticate` / `checkRole` cho route cần bảo vệ (vd `POST /api/products`)
- [ ] Quản lý thiết bị: `listByUser`, `revokeAllByUser` trong `session.service.js` + API
- [ ] Quên / đặt lại mật khẩu, xác thực email (stub trong `auth.controller.js`)
- [ ] Rate limit đăng nhập (chống brute force)
- [ ] Product: chuyển controller sang `sendSuccess` + `req.validated.body`, thêm get / update / delete
- [ ] Frontend: trang đăng nhập / đăng ký gọi `/api/auth`
- [ ] Xử lý `npm audit` (body-parser, qs — dependency gián tiếp của Express)
- [ ] Thêm test tự động

## Quyết định đã chốt

- Monorepo npm workspaces + concurrently, gốc repo là `TienThanh/` ([ADR-001](docs/06-quyet-dinh/ADR-001-monorepo-npm-workspaces.md))
- Auth: cookie httpOnly cho cả 2 token, fallback Bearer, session collection riêng + rotation, `cookie-parser` ([ADR-002](docs/06-quyet-dinh/ADR-002-cookie-auth-session-rotation.md))
- Frontend: React + Vite (JS), gọi API qua proxy cùng origin
