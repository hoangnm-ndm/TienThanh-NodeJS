# 05 — Người dùng & phân quyền

Dùng khi làm việc với role, khoá / mở khoá tài khoản, hoặc seed superAdmin. Trước: [04 — Xác thực](04-xac-thuc.md) · Tiếp: [06 — Sản phẩm](06-san-pham.md)

Code: `backend/src/modules/user/`, `backend/src/shared/constants/roles.js`, `backend/src/seeds/`. Lý do thiết kế: [ADR-003](07-quyet-dinh/ADR-003-phan-quyen-role-va-superadmin-duy-nhat.md).

## Role và cấp bậc

| Role | Cấp (`ROLE_LEVEL`) | Có được |
| --- | --- | --- |
| `superAdmin` | 3 | Đổi role (member ↔ admin) của người khác; khoá / mở khoá admin và member |
| `admin` | 2 | Khoá / mở khoá member |
| `member` | 1 | Không có quyền quản lý user. Đây là role mặc định khi đăng ký |

Luật chung, áp cho mọi thao tác:

1. **Không ai tự thao tác lên chính mình** → `403 CANNOT_MODIFY_SELF`.
2. **Chỉ tác động lên người có cấp thấp hơn hẳn** → `403 TARGET_ROLE_NOT_ALLOWED`. Admin không khoá được admin khác. superAdmin là cấp cao nhất nên không ai khoá được.
3. **Chỉ có đúng 1 superAdmin.** API không cho gán role `superAdmin`. MongoDB còn có unique index riêng phần (`role_1`, chỉ áp cho document `role: "superAdmin"`), nên ghi superAdmin thứ hai từ bất kỳ đâu (code, mongosh) đều bị lỗi `E11000`.

Đổi role / khoá có hiệu lực **ngay ở request tiếp theo** của người bị tác động, vì `authenticate` đọc role và trạng thái khoá từ DB ([04 — Bảo vệ route](04-xac-thuc.md#bảo-vệ-route)).

## API

Base: `/api/users`. Mọi route đều qua `authenticate` (chưa đăng nhập → `401`). Format response và lỗi chung: [03 — Lỗi và response](03-quy-uoc-code.md#lỗi-và-response).

| Method · Path | Role được gọi | Input | Thành công |
| --- | --- | --- | --- |
| `PATCH /:id/role` | `superAdmin` | `{ "role": "admin" \| "member" }` | `200`, `data` = user |
| `PATCH /:id/block` | `admin`, `superAdmin` | — | `200`, `data` = user (`isBlocked: true`) |
| `PATCH /:id/unblock` | `admin`, `superAdmin` | — | `200`, `data` = user (`isBlocked: false`) |

- `:id` phải là ObjectId 24 ký tự hex → nếu sai: `400 VALIDATION_ERROR` (`params.id`).
- Body `role` dùng `.strict()`; `superAdmin` hay giá trị khác → `400` "Role chỉ được là: admin, member".
- **Idempotent**: khoá tài khoản đã khoá, mở khoá tài khoản đang mở, hoặc đặt role trùng role hiện tại → vẫn `200`, `message` cho biết không thay đổi.
- `data` user: `{ id, email, role, language, isVerify, isBlocked, blockedAt, createdAt }`.

| Lỗi | Khi nào |
| --- | --- |
| `401 UNAUTHORIZED` / `TOKEN_*` | Chưa đăng nhập, token sai / hết hạn |
| `403 FORBIDDEN` | Role người gọi không nằm trong cột "Role được gọi" |
| `403 CANNOT_MODIFY_SELF` | `:id` là chính người gọi |
| `403 TARGET_ROLE_NOT_ALLOWED` | Người bị tác động không có cấp thấp hơn người gọi |
| `404 USER_NOT_FOUND` | Không có user với `:id` |
| `409 DUPLICATE_KEY` | Role của người bị tác động vừa thay đổi giữa lúc kiểm tra và lúc ghi (hiếm). Gọi lại |

Khi **khoá**: mọi session của người bị khoá bị thu hồi (`sessionService.revokeAllByUser`). Mọi thiết bị của họ lập tức nhận `403 ACCOUNT_BLOCKED`, và refresh trả `401`. Sau khi **mở khoá**, người đó phải đăng nhập lại.

Thử nhanh (đã đăng nhập superAdmin, cookie lưu trong `jar`):

```bash
curl -i -X PATCH -b jar -H "Content-Type: application/json" \
  -d '{"role":"admin"}' http://localhost:8000/api/users/<id-user>/role
curl -i -X PATCH -b jar http://localhost:8000/api/users/<id-user>/block
curl -i -X PATCH -b jar http://localhost:8000/api/users/<id-user>/unblock
```

## Tạo superAdmin đầu tiên (seed)

Đăng ký luôn tạo `member`, nên superAdmin phải được tạo bằng seed.

1. **Điền** `SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD` vào `backend/.env` ([bảng biến](01-chay-local.md#biến-môi-trường)). Mật khẩu theo cùng rule như khi đăng ký.
2. **Chạy** ở gốc repo:

   ```bash
   npm run db:seed
   ```

3. **Kết quả mong đợi**: một trong các dòng sau.

   | Dòng log | Ý nghĩa |
   | --- | --- |
   | `[seed:superAdmin] Đã tạo superAdmin <email>` | Tạo user mới với role superAdmin |
   | `[seed:superAdmin] Đã nâng <email> lên superAdmin (giữ nguyên mật khẩu)` | Email đã đăng ký từ trước, được nâng role |
   | `[seed:superAdmin] superAdmin <email> đã tồn tại, không thay đổi` | Chạy lại, không làm gì |
   | `[seed:superAdmin] Bỏ qua: hệ thống đã có superAdmin khác (<email>)` | DB đã có superAdmin, seed không tạo thêm |
   | `[seed:superAdmin] Bỏ qua: chưa điền SEED_SUPER_ADMIN_EMAIL` | Không seed superAdmin |

4. **Kiểm tra**: đăng nhập bằng email đó → `GET /api/auth/me` trả `"role":"superAdmin"`.
5. **Nếu sai**: `[seed] Thất bại: …` và exit code 1. Đọc thông báo: mật khẩu không đạt rule, hoặc email chưa có user mà thiếu mật khẩu.

Seed **idempotent**, chạy lại bao nhiêu lần cũng được. Muốn đổi người giữ superAdmin thì hiện phải sửa tay trong DB: hạ superAdmin cũ trước, sau đó mới nâng người mới, vì unique index chặn trạng thái có 2 superAdmin. Chưa có API chuyển giao quyền.

Thêm seeder mới: tạo `backend/src/seeds/<tên>.seed.js` export một hàm `async` trả về chuỗi log, rồi thêm vào mảng `SEEDERS` trong `backend/src/seeds/index.js` theo thứ tự phụ thuộc. Seeder phải idempotent.

## Edge case & giới hạn

- DB có sẵn **hơn 1 superAdmin** (dữ liệu cũ, sửa tay) → Mongoose không tạo được unique index `role_1` khi khởi động, nên lớp chặn ở DB không có hiệu lực. Kiểm tra bằng `db.users.countDocuments({ role: "superAdmin" })`, hạ bớt về 1, rồi khởi động lại.
- Chưa có API: danh sách user, xem chi tiết user, chuyển giao superAdmin, lịch sử ai khoá ai (audit log).
- Chưa có test tự động. Các luồng trên đã kiểm tra thủ công bằng curl ngày 2026-11-01.
