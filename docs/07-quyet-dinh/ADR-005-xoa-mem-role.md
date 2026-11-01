# ADR-005 · Xoá mềm role và khôi phục (2026-11-01)

Bổ sung cho [ADR-004](ADR-004-phan-quyen-dong-rbac.md). Thay phần "xoá role" của ADR-004 (trước đây xoá hẳn document). Chi tiết: [05 — Xoá mềm và khôi phục role](../05-nguoi-dung.md#xoá-mềm-và-khôi-phục-role). Mục lục: [docs/README.md](../README.md)

- **Bối cảnh**: cần xoá role mà vẫn khôi phục được nếu xoá nhầm, và vẫn giữ lại thông tin role đã xoá.
- **Quyết định**:
  - Role có thêm `deletedAt` và `deletedBy`. `DELETE /api/roles/:id` chỉ đặt `deletedAt`, không xoá document. Khôi phục bằng `PATCH /api/roles/:id/restore`.
  - Giữ luật của ADR-004:
    - role đang có user dùng thì không xoá được (`409`);
    - role hệ thống không xoá được;
    - chỉ thao tác với role có level thấp hơn hẳn cấp của mình.
  - Khôi phục dùng chung permission `role:delete` (khôi phục là thao tác ngược của xoá). Không thêm permission mới, nên DB đang chạy không cần migration quyền.
  - Tên chỉ unique giữa các role chưa xoá (unique index riêng phần `deletedAt: null`). Khôi phục bị trùng tên → `409`, cho phép gửi tên mới kèm theo.
  - Khôi phục **không** gán lại role cho user nào.
  - Role đã xoá bị loại khỏi mọi truy vấn nghiệp vụ (`ACTIVE_ROLE`, `populate` có `match`).
  - Phương án bị loại:
    - Tên role đã xoá vẫn được giữ: người dùng không tạo lại được role cùng tên.
    - Thêm permission riêng `role:restore`: phải migration quyền cho role admin đang có trong DB.
    - Query middleware tự lọc `deletedAt`: ngầm định, khó thấy khi đọc code.
- **Hệ quả**:
  - Xoá nhầm thì khôi phục được, và vẫn biết ai xoá.
  - Collection `roles` giữ cả role đã xoá. Chưa có xoá vĩnh viễn hay tự dọn.
  - Mọi code mới truy vấn role phải nhớ lọc role đã xoá.
  - Cần chạy `npm run db:seed` để bỏ index `name_1` cũ.
