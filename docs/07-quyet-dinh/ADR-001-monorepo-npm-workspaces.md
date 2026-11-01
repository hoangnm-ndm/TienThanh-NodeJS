# ADR-001 · Monorepo với npm workspaces (2026-11-01)

Dùng khi muốn biết vì sao repo có cấu trúc `backend/` + `frontend/` + `docs/` và dùng npm workspaces. Mục lục: [docs/README.md](../README.md)

- **Bối cảnh**: repo ban đầu chỉ chứa backend ở gốc. Dự án cần thêm frontend và docs, và muốn chạy / quản lý chung bằng một bộ lệnh.
- **Quyết định**:
  - Chuyển backend vào `backend/` (dùng `git mv`, giữ lịch sử).
  - Frontend React + Vite ở `frontend/`, docs ở `docs/`.
  - Quản lý bằng **npm workspaces**: một `node_modules/` và một `package-lock.json` ở gốc.
  - Dùng `concurrently` để `npm run dev` chạy BE + FE song song.
  - Phương án bị loại: pnpm workspaces (phải đổi package manager), script spawn tự viết (tự bảo trì).
- **Hệ quả**:
  - Mọi lệnh chạy từ gốc repo.
  - Thêm dependency phải chỉ rõ workspace (`npm install <gói> -w backend`).
  - Lockfile cũ của backend được đưa lên gốc, nên giữ nguyên phiên bản dependency backend.
  - `envConfig` đọc `backend/.env` theo đường dẫn của file, không theo thư mục đang đứng.
  - `.env` được gỡ khỏi git (trước đó bị track nhầm dù có trong `.gitignore`). Lịch sử commit cũ vẫn còn file này.
