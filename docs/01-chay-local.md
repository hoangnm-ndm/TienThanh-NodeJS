# 01 — Chạy local

Dùng khi cài dự án lần đầu hoặc máy mới. Tiếp: [02 — Kiến trúc](02-kien-truc.md)

## Yêu cầu

| Công cụ | Phiên bản | Kiểm tra |
| --- | --- | --- |
| Node.js | ≥ 22 (`.nvmrc` = 22) | `node -v` → `v22.x` trở lên |
| npm | ≥ 10 (đi kèm Node 22) | `npm -v` |
| MongoDB | Atlas hoặc MongoDB local | Atlas: có connection string · Local: `mongod --version` |

Dùng nvm: chạy `nvm use` ở gốc repo để lấy đúng phiên bản trong `.nvmrc`.

## Các bước

Mọi lệnh chạy ở **gốc repo** (`TienThanh/`), không `cd` vào `backend/` hay `frontend/`.

### 1. Cài dependency và tạo file env

```bash
npm run setup
```

- **Làm gì**: `npm install` cho cả 2 workspace (một `node_modules/` và một `package-lock.json` ở gốc), sau đó `npm run env:sync`.
- **Kết quả mong đợi**: có `backend/.env` và `frontend/.env`; terminal in `[backend] Tạo .env mới, … biến đang chờ điền` hoặc `.env đã đủ biến`.
- **Kiểm tra**: `ls backend/.env frontend/.env`.
- **Nếu sai**: `npm install` lỗi → xem [Lỗi hay gặp](#lỗi-hay-gặp).

`env:sync` (`scripts/env-sync.mjs`) chỉ **thêm** biến còn thiếu (giá trị trống), không ghi đè giá trị đã điền. Nó báo cả biến có trong `.env` mà không có trong `.env.example`, khi đó lệnh trả exit code 1.

### 2. Điền biến bắt buộc vào `backend/.env`

Bắt buộc: `DB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. Các biến khác để trống thì dùng mặc định ([bảng đầy đủ](#biến-môi-trường)).

Tạo secret ngẫu nhiên cho môi trường dev:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Chạy 2 lần, mỗi kết quả cho một secret. Hai secret phải **khác nhau**.

MongoDB local (macOS, Homebrew):

```bash
brew services start mongodb-community   # hoặc: mongod --dbpath <thư-mục-data>
# backend/.env → DB_URI=mongodb://127.0.0.1:27017/tienthanh-dev
```

### 3. Chạy dev

```bash
npm run dev
```

- **Kết quả mong đợi**: log có tiền tố `[be]` và `[fe]`:
  - `[be] server is running on port: 8000`
  - `[be] Connect Database successfully!`
  - `[fe] ➜  Local:   http://localhost:5173/`
- **Kiểm tra**:
  - `curl -i http://localhost:8000/api/products` → `HTTP/1.1 200` (backend trực tiếp).
  - `curl -i http://localhost:5173/api/products` → `200` (qua proxy của Vite).
  - Mở http://localhost:5173 thấy trang React.
- **Nếu sai**: xem [Lỗi hay gặp](#lỗi-hay-gặp).

`Ctrl + C` dừng cả hai process. `concurrently -k`: một bên chết thì bên kia cũng dừng.

## Lệnh ở gốc repo

| Lệnh | Việc làm |
| --- | --- |
| `npm run setup` | Cài dependency + đồng bộ `.env` |
| `npm run env:sync` | Thêm biến còn thiếu từ `.env.example` vào `.env` của từng workspace |
| `npm run dev` | Chạy backend + frontend song song |
| `npm run dev:backend` | Chỉ backend (`node --watch`, tự restart khi sửa file) |
| `npm run dev:frontend` | Chỉ frontend (Vite) |
| `npm start` | Chạy backend không watch |
| `npm run db:seed` | Seed dữ liệu ban đầu (superAdmin) — [05 — Seed](05-nguoi-dung.md#tạo-superadmin-đầu-tiên-seed) |
| `npm run build` | Build frontend ra `frontend/dist/` |
| `npm run preview` | Xem bản build frontend |
| `npm run lint` | Lint mọi workspace có script `lint` (hiện chỉ frontend — oxlint) |

Thêm dependency cho một workspace: `npm install <gói> -w backend` (hoặc `-w frontend`). Tool dùng chung ở gốc: `npm install -D <gói>` (không có `-w`).

Kiểm tra trước commit: `npm run lint` và `npm run build`. Chưa có test tự động (kiểm tra 2026-11-01).

## Biến môi trường

Nguồn duy nhất của danh sách biến là `backend/.env.example` và `frontend/.env.example`. Thêm / đổi / xoá biến thì sửa file mẫu, chạy `npm run env:sync`, rồi cập nhật bảng này. Biến để trống = chưa khai báo → dùng mặc định.

**`backend/.env`** — đọc ở `backend/src/config/envConfig.js`:

| Biến | Bắt buộc | Mặc định | Ý nghĩa |
| --- | --- | --- | --- |
| `NODE_ENV` | | `development` | `production` bật cookie `secure` (chỉ gửi qua HTTPS) |
| `PORT` | | `8000` | Cổng API (lắng nghe trên `localhost`) |
| `DB_URI` | ✔ | — | Connection string MongoDB |
| `LOG_LEVEL` | | `info` | Mức log pino |
| `BCRYPT_SALT_ROUNDS` | | `10` | Số vòng salt khi hash mật khẩu |
| `JWT_ACCESS_SECRET` | ✔ | — | Secret ký access token |
| `JWT_ACCESS_EXPIRES_IN` | | `15m` | Hạn access token (`30s`, `15m`, `1h`, `7d`) |
| `JWT_REFRESH_SECRET` | ✔ | — | Secret ký refresh token, khác access secret |
| `JWT_REFRESH_EXPIRES_IN` | | `7d` | Hạn refresh token = hạn session |
| `COOKIE_DOMAIN` | | domain hiện tại | Domain gắn cho cookie auth |
| `SEED_SUPER_ADMIN_EMAIL` | | — (trống = bỏ qua) | Email superAdmin cho `npm run db:seed` |
| `SEED_SUPER_ADMIN_PASSWORD` | khi seed tạo user mới | — | Mật khẩu superAdmin, theo rule mật khẩu đăng ký |

Thiếu biến bắt buộc → backend in `[envConfig] Biến môi trường bắt buộc chưa điền: …` rồi thoát.

**`frontend/.env`** — chỉ đọc trong `frontend/vite.config.js` (không lộ ra code client):

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `API_PROXY_TARGET` | `http://localhost:8000` | Backend mà Vite proxy `/api` tới. Đổi `PORT` backend thì đổi biến này theo |
| `FRONTEND_PORT` | `5173` | Cổng Vite dev server |

## Lỗi hay gặp

| Hiện tượng | Nguyên nhân / kiểm tra | Cách xử lý |
| --- | --- | --- |
| `[envConfig] Biến môi trường bắt buộc chưa điền: …` | `backend/.env` thiếu giá trị | Điền các biến được liệt kê ([bước 2](#2-điền-biến-bắt-buộc-vào-backendenv)) |
| `Connect Database failed` | `DB_URI` sai, Mongo local chưa chạy, hoặc IP chưa được Atlas cho phép | Local: `mongosh "<DB_URI>"` thử kết nối · Atlas: kiểm tra Network Access |
| `EADDRINUSE :8000` hoặc Vite tự nhảy sang cổng khác | Cổng đang bị process khác dùng | `lsof -iTCP:8000 -sTCP:LISTEN` để tìm process, hoặc đổi `PORT` / `FRONTEND_PORT` |
| FE gọi `/api/...` bị `502` / `ECONNREFUSED` trong log `[fe]` | Backend chưa chạy hoặc `API_PROXY_TARGET` lệch `PORT` | Kiểm tra log `[be]`; đồng bộ 2 biến |
| Đăng nhập thành công nhưng `/api/auth/me` vẫn 401 | Client không gửi cookie | `fetch` cần `credentials: "include"`; gọi qua proxy `/api` (cùng origin), không gọi thẳng `:8000` từ trình duyệt |
| `npm run env:sync` exit code 1 | **Không phải lỗi cài đặt**: có biến trong `.env` mà thiếu ở `.env.example` | Thêm biến đó vào `.env.example` (giá trị trống) |
| `npm audit` báo lỗ hổng `body-parser`, `qs` | Dependency gián tiếp của Express (kiểm tra 2026-11-01) | Chưa xử lý; theo dõi trong [CHECKLIST](../CHECKLIST.md) |
