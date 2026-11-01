# ADR-002 · Auth bằng cookie httpOnly + session lưu DB có rotation (2026-11-01)

Dùng khi muốn biết vì sao auth thiết kế như hiện tại. Chi tiết luồng: [04 — Xác thực](../04-xac-thuc.md). Mục lục: [docs/README.md](../README.md)

- **Bối cảnh**: cần đăng nhập / đăng xuất / làm mới token. Đăng xuất phải thực sự vô hiệu hoá token. Sau này cần quản lý phiên và thiết bị đăng nhập của người dùng.
- **Quyết định**:
  - Access token và refresh token đều là JWT, đặt trong **cookie httpOnly**. `authenticate` fallback đọc header `Authorization: Bearer` cho Postman / mobile.
  - Refresh token lưu **hash** trong collection riêng `sessions`, mỗi document là một thiết bị (`userAgent`, `ip`, `lastUsedAt`, `revokedAt`, TTL `expiresAt`).
  - Mỗi lần refresh **rotation** token. Token cũ bị dùng lại thì thu hồi cả session.
  - Đọc cookie bằng thư viện `cookie-parser`.
  - Phương án bị loại:
    - Lưu refresh token trên field của User: chỉ được một phiên.
    - JWT stateless: logout không thu hồi được token.
    - Access token trả trong body: frontend phải tự quản lý token, dễ lộ qua XSS.
- **Hệ quả**:
  - Logout và khoá tài khoản có hiệu lực thật.
  - Mở rộng "danh sách thiết bị / đăng xuất thiết bị khác" không cần đổi schema.
  - Mỗi request có xác thực tốn một query DB (`authenticate` đọc role và trạng thái khoá mới nhất).
  - Frontend phải gọi API cùng origin (proxy `/api`) và dùng `credentials: "include"`.
  - Chưa có chống CSRF ngoài `SameSite=Lax`. Nếu sau này frontend và API khác site thì phải xem lại.
