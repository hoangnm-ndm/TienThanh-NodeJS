# Docs dự án TienThanh

Mục lục docs cho dev — người sửa code backend / frontend. Dev mới đọc theo thứ tự dưới đây.

```mermaid
flowchart LR
  A[01 Chạy local] --> B[02 Kiến trúc] --> C[03 Quy ước code]
  C --> D[04 Xác thực] --> G[05 Người dùng & phân quyền]
  C --> E[06 Sản phẩm]
  B -.-> F[07 Quyết định / ADR]
```

| File | Đọc khi |
| --- | --- |
| [01-chay-local.md](01-chay-local.md) | Lần đầu cài và chạy dự án; bảng biến môi trường đầy đủ |
| [02-kien-truc.md](02-kien-truc.md) | Cần hiểu FE / BE / DB nối với nhau ra sao, muốn biết "sửa X ở đâu" |
| [03-quy-uoc-code.md](03-quy-uoc-code.md) | Trước khi thêm module / route / schema mới |
| [04-xac-thuc.md](04-xac-thuc.md) | Làm việc với đăng nhập, cookie, token, phân quyền |
| [05-nguoi-dung.md](05-nguoi-dung.md) | Role, permission, gán role, khoá / mở khoá user, seed |
| [06-san-pham.md](06-san-pham.md) | Làm việc với API sản phẩm |
| [07-quyet-dinh/](07-quyet-dinh/README.md) | Muốn biết vì sao chọn cấu trúc / công nghệ hiện tại |

Chưa có docs triển khai & vận hành: repo chưa có cấu hình triển khai (Dockerfile, CI, deploy) — kiểm tra 2026-11-01.
