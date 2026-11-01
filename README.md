# TienThanh

Monorepo học tập gồm REST API **Node.js + Express 5 + MongoDB** (xác thực JWT bằng cookie httpOnly, session theo thiết bị) và frontend **React + Vite**.

```text
TienThanh/
├── backend/    # REST API (Express, Mongoose, zod)
├── frontend/   # React + Vite, proxy /api → backend
├── docs/       # Tài liệu dev (đọc docs/README.md)
├── scripts/    # Script dùng chung (env-sync)
└── package.json  # npm workspaces + lệnh chung
```

## Quickstart

Yêu cầu: Node.js ≥ 22, MongoDB (Atlas hoặc local).

```bash
nvm use                 # Node theo .nvmrc (tuỳ chọn)
npm run setup           # cài dependency + tạo backend/.env, frontend/.env
# điền DB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET vào backend/.env
npm run dev             # backend :8000 + frontend :5173
```

Mở http://localhost:5173. API gọi qua `/api/...`.

## Lệnh chính

| Lệnh | Việc làm |
| --- | --- |
| `npm run dev` | Chạy backend + frontend song song |
| `npm run dev:backend` / `npm run dev:frontend` | Chạy riêng từng phần |
| `npm run build` | Build frontend |
| `npm run lint` | Lint các workspace |
| `npm run env:sync` | Đồng bộ biến từ `.env.example` sang `.env` |
| `npm run db:seed` | Seed dữ liệu ban đầu (superAdmin từ env) |

Danh sách lệnh và biến môi trường đầy đủ: [docs/01-chay-local.md](docs/01-chay-local.md).

## Tài liệu

- [docs/README.md](docs/README.md): mục lục và thứ tự đọc
- [CHECKLIST.md](CHECKLIST.md): tiến độ và việc tiếp theo
