# ADR-003 · Phân quyền theo cấp role, chỉ 1 superAdmin, seed bằng env (2026-11-01)

Dùng khi muốn biết vì sao luật đổi role / khoá tài khoản như hiện tại. Chi tiết: [05 — Người dùng & phân quyền](../05-nguoi-dung.md). Mục lục: [docs/README.md](../README.md)

- **Bối cảnh**:
  - superAdmin được nâng / hạ role người khác, trừ chính mình.
  - Hệ thống chỉ chấp nhận 1 superAdmin.
  - Từ admin trở lên mới được khoá / mở khoá.
  - Đăng ký luôn tạo member, nên cần cách tạo superAdmin đầu tiên.
- **Quyết định**:
  - Cấp bậc `member (1) < admin (2) < superAdmin (3)` (`ROLE_LEVEL`). Mọi thao tác quản lý user chỉ tác động lên người **cấp thấp hơn hẳn**, và không áp lên chính mình.
  - API **không** cho gán role `superAdmin`. Thêm unique index riêng phần trên `role` (chỉ áp cho `superAdmin`) để DB cũng chặn.
  - Khoá tài khoản thì thu hồi mọi session của người đó.
  - Thao tác không đổi gì vẫn trả `200` (idempotent).
  - superAdmin đầu tiên tạo bằng `npm run db:seed` từ `SEED_SUPER_ADMIN_EMAIL` / `SEED_SUPER_ADMIN_PASSWORD`. Khung `src/seeds/` cho phép thêm seeder khác sau này.
  - Phương án bị loại:
    - Admin được khoá admin khác: các admin có thể khoá lẫn nhau.
    - Chuyển giao superAdmin qua API: cần transaction (replica set), chưa cần.
    - Tự nâng superAdmin lúc server khởi động: logic chạy mỗi lần start.
- **Hệ quả**:
  - Admin không xử lý được admin khác, phải nhờ superAdmin.
  - Đổi người giữ superAdmin hiện phải sửa tay DB, theo thứ tự hạ trước rồi nâng sau.
  - DB cũ có hơn 1 superAdmin thì không tạo được index, phải dọn dữ liệu trước.
