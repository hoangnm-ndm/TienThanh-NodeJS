# 06 — Sản phẩm (products)

Dùng khi làm việc với API sản phẩm. Ghi theo hiện trạng code ngày 2026-11-01. Trước: [05 — Người dùng & phân quyền](05-nguoi-dung.md)

Code: `backend/src/modules/product/`.

## Mô hình dữ liệu

| Field | Kiểu | Ràng buộc |
| --- | --- | --- |
| `title` | String | bắt buộc |
| `price` | Number | bắt buộc |
| `createdAt`, `updatedAt` | Date | tự sinh (`timestamps`) |

## API

Base: `/api/products`. **Chưa yêu cầu đăng nhập**. Muốn bảo vệ thì gắn middleware theo [04 — Bảo vệ route](04-xac-thuc.md#bảo-vệ-route).

| Method · Path | Middleware | Input | Thành công | Lỗi |
| --- | --- | --- | --- | --- |
| `GET /` | — | — | `200`, `data` = mảng sản phẩm (rỗng thì `[]`, message "Chua co san pham nao!") | — |
| `POST /` | `validate(body)` | `{ title: string ≥ 3 ký tự, price: number ≥ 0 }` | `201`, `data` = sản phẩm | `400 VALIDATION_ERROR` |

## Giới hạn hiện tại

- `productUpdateSchema` đã khai báo nhưng chưa có route cập nhật / xoá / lấy chi tiết.
- Controller chưa theo [quy ước](03-quy-uoc-code.md#phân-tầng-route--controller--service): tự `res.status().json()`, `createOne` đọc `req.body` thay vì `req.validated.body`. Schema chưa `.strict()`, nên field lạ vẫn lọt xuống DB nếu model không chặn (Mongoose `strict` mặc định bỏ field không khai báo).
- Message chưa có dấu tiếng Việt.
