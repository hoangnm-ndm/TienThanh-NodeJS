# ADR-004 · Phân quyền động (RBAC): role trong DB, permission cố định, nhiều role mỗi user (2026-11-01)

Thay [ADR-003](ADR-003-phan-quyen-role-va-superadmin-duy-nhat.md). Dùng khi muốn biết vì sao phân quyền thiết kế như hiện tại. Chi tiết: [05 — Người dùng & phân quyền](../05-nguoi-dung.md). Mục lục: [docs/README.md](../README.md)

- **Bối cảnh**: cần CRUD role, thêm / bớt permission cho role, và một người có nhiều role. ADR-003 dùng role cố định trong code (`superAdmin | admin | member`), nên làm không được.
- **Quyết định**:
  - **Permission là danh mục cố định trong code** (`resource:action`), vì permission chỉ có nghĩa khi có code kiểm tra. **Role là dữ liệu** (`roles`: `name`, `permissions[]`, `level`, `isSystem`). User có `roles[]`.
  - Route kiểm tra permission bằng `authorize(...)`, thay `checkRole`.
  - Permission không đưa vào JWT; `authenticate` populate role mỗi request.
  - superAdmin là **cờ `isSuperAdmin`** trên user, không phải role. Cờ này bỏ qua mọi kiểm tra, và unique index riêng phần giữ luật chỉ 1 superAdmin.
  - Chống leo thang đặc quyền bằng **level + tập con permission**:
    - chỉ tác động lên user / role có level thấp hơn hẳn mình;
    - chỉ cấp permission mình đang có;
    - không tự tác động lên mình.
  - Xoá role đang được gán thì trả `409`.
  - Role hệ thống `admin` (50), `member` (1, mặc định khi đăng ký) do seed tạo. Migration trong seed chuyển dữ liệu `role` cũ.
  - Phương án bị loại:
    - superAdmin là role có permission `*`: phải tự chặn sửa / xoá / gán, và khó áp unique index lên mảng `roles`.
    - Chỉ dựa tập con permission, không có level: hai người cùng quyền có thể khoá / gỡ role của nhau.
    - Tự gỡ role khỏi user khi xoá: lỡ tay là nhiều người mất quyền.
    - Thư viện CASL / Casbin: chưa cần, vì chưa có quyền theo dữ liệu.
- **Hệ quả**:
  - Đổi quyền có hiệu lực ngay, không cần deploy.
  - Mỗi request xác thực tốn thêm 1 query populate role. Khi tải lớn cần cache có cơ chế xoá cache.
  - **Thay đổi không tương thích ngược**:
    - Response user đổi từ `role` sang `roles[]` + `isSuperAdmin`.
    - API `PATCH /api/users/:id/role` bị bỏ, thay bằng `PUT /api/users/:id/roles`.
    - Access token không còn `role`.
  - Sau khi cập nhật code phải chạy `npm run db:seed`, nếu không thì đăng ký lỗi `500` và user dữ liệu cũ mất quyền.
  - Thêm permission mới vẫn phải sửa code; đây là chủ đích của thiết kế.
