# Frontend — React + Vite

Giao diện của dự án TienThanh. Chạy trong monorepo, xem hướng dẫn chung ở [README gốc](../README.md).

## Lệnh

Chạy từ thư mục gốc repo:

| Lệnh | Việc làm |
| --- | --- |
| `npm run dev:frontend` | Vite dev server (mặc định http://localhost:5173) |
| `npm run build` | Build production ra `frontend/dist` |
| `npm run preview` | Xem thử bản build |
| `npm run lint -w frontend` | Lint bằng oxlint |

## Gọi API

Gọi đường dẫn tương đối `/api/...`; Vite proxy sang backend (`API_PROXY_TARGET`, mặc định
`http://localhost:8000`). Cookie auth là httpOnly nên dùng `credentials: "include"` khi gọi `fetch`:

```js
await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({ email, password }),
});
```

## Biến môi trường

Copy từ `.env.example` (hoặc `npm run env:sync` ở gốc). Bảng biến: [docs/01-chay-local.md](../docs/01-chay-local.md#biến-môi-trường).
