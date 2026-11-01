# CLAUDE.md — TienThanh

Monorepo npm workspaces: `backend/` (Express 5 + Mongoose 9 + zod 4, ESM), `frontend/` (React 19 + Vite 8), `docs/`, `scripts/`. Docs dev: [docs/README.md](docs/README.md).

## Lệnh (chạy ở gốc repo)

- `npm run setup` · `npm run dev` (BE :8000 + FE :5173) · `npm run dev:backend` · `npm run dev:frontend`
- `npm run lint` · `npm run build` · `npm run env:sync` · `npm run db:seed` (role hệ thống, migration, superAdmin; chạy trước khi dùng API)
- Thêm dependency: `npm install <gói> -w backend|frontend`; tool chung: `npm install -D <gói>` ở gốc.
- Chưa có test tự động → kiểm tra thủ công bằng curl. Test cần DB thì dùng MongoDB local tạm qua biến môi trường (`DB_URI=mongodb://127.0.0.1:<port>/... npm run dev:backend`), **không** chạy test vào DB Atlas trong `backend/.env`.

## Ràng buộc

- Backend: import ESM phải có đuôi `.js`; env chỉ đọc qua `backend/src/config/envConfig.js`.
- Phân tầng route → controller → service → model; controller đọc `req.validated.*`, trả `sendSuccess`, lỗi `throw httpErrors.*`. Chi tiết: [docs/03-quy-uoc-code.md](docs/03-quy-uoc-code.md).
- Auth: cookie httpOnly + session lưu DB có rotation ([docs/04-xac-thuc.md](docs/04-xac-thuc.md)). Route cần bảo vệ: `authenticate` rồi `authorize(PERMISSIONS.X)`.
- Phân quyền động (RBAC): permission cố định trong `shared/constants/permissions.js`, role là dữ liệu DB, user có `roles[]`, superAdmin = cờ `isSuperAdmin` (tối đa 1). Mọi thao tác quản lý phải giữ luật chống leo thang: không tự tác động lên mình, chỉ đụng level thấp hơn hẳn (`assertLevelBelow`), chỉ cấp permission mình có (`assertCanGrant`) — [docs/05-nguoi-dung.md](docs/05-nguoi-dung.md).
- Role xoá mềm (`deletedAt`): mọi truy vấn role nghiệp vụ phải lọc bằng `ACTIVE_ROLE`, populate role của user dùng `ROLE_ACCESS_POPULATE` (`backend/src/modules/role/role.model.js`).
- Seeder trong `backend/src/seeds/` phải idempotent.
- Frontend gọi API bằng đường dẫn tương đối `/api/...` (Vite proxy, cùng origin) + `credentials: "include"`; backend không bật CORS.
- Thêm / đổi biến env: sửa `.env.example` của workspace → `npm run env:sync` → cập nhật bảng ở `docs/01-chay-local.md`.
- Quyết định kiến trúc mới → thêm ADR ở `docs/07-quyet-dinh/` (không sửa ADR cũ).
- Message trả client và comment: tiếng Việt có dấu; comment giải thích dùng tiền tố `// *`.
