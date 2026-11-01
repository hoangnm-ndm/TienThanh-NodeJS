# 03 — Quy ước code

Dùng trước khi thêm module, route, schema hay lỗi mới. Các quy ước dưới đây rút từ code hiện có. Module mẫu đầy đủ nhất là `backend/src/modules/auth/`. Trước: [02 — Kiến trúc](02-kien-truc.md) · Tiếp: [04 — Xác thực](04-xac-thuc.md)

## Chung

- ES Modules (`"type": "module"`): import **phải có đuôi `.js`** (`import { User } from "../user/user.model.js"`). Thiếu đuôi thì Node báo `ERR_MODULE_NOT_FOUND`.
- Tên biến, hàm, file: tiếng Anh. Thông báo trả cho người dùng và comment: tiếng Việt có dấu.
- Comment giải thích dùng tiền tố `// *` (theo code hiện có).
- Export dạng named (`export const authService = {...}`). Model `post` hiện còn `export default`, là ngoại lệ cũ.

## Phân tầng route → controller → service

| Tầng | Được làm | Không làm |
| --- | --- | --- |
| `*.route.js` | Khai báo method + path, gắn `validate`, `authenticate`, `checkRole` | Logic |
| `*.controller.js` | Lấy input đã validate (`req.validated.*`), gọi service, set cookie, trả `sendSuccess` | Query DB, business rule |
| `*.service.js` | Business logic, gọi model, `throw httpErrors.*` | Đụng `req` / `res` |
| `*.model.js` | Mongoose schema, index | Logic nghiệp vụ |

Đúng — `backend/src/modules/auth/auth.controller.js`:

```js
login: async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.validated.body, getClientContext(req));
  setAuthCookies(res, { accessToken, refreshToken });
  return sendSuccess(res, { message: "Đăng nhập thành công", data: user });
},
```

Sai — controller tự query DB và tự viết JSON lỗi:

```js
const userExist = await User.findOne({ email });
if (userExist) return res.status(400).json({ success: false, message: "..." });
```

`product.controller.js` vẫn đang tự viết `res.status().json()` và đọc `req.body` thay vì `req.validated.body`. Code cũ đó chưa chuyển sang quy ước này.

## Validate input

- Schema zod đặt trong `<module>.schema.js`, gắn bằng `validate({ params, query, body, cookies })` (`backend/src/shared/middlewares/validate.js`).
- Controller đọc dữ liệu **đã parse** ở `req.validated.<phần>` (đã trim, lowercase, coerce), không đọc `req.body` thô.
- Body nhận từ client dùng `.strict()` để từ chối field lạ, ví dụ client tự gửi `role`.
- Thông báo lỗi viết trong schema, tiếng Việt: `z.string().min(6, "Password tối thiểu 6 ký tự")`.
- Lỗi validate → `400 VALIDATION_ERROR`, `details[].field` có tiền tố phần request: `body.email`, `cookies.refreshToken`.

## Lỗi và response

Ném lỗi bằng factory trong `backend/src/shared/errors/httpErrors.js`. Mã lỗi khai báo ở `errorCodes.js`:

```js
throw httpErrors.conflict("Email đã được sử dụng", ERROR_CODES.EMAIL_ALREADY_EXISTS);
```

Thành công dùng `sendSuccess(res, { statusCode, message, data })` (`backend/src/shared/utils/response.js`).

| | Format |
| --- | --- |
| Thành công | `{ "success": true, "message": "...", "data": ... }` (không có `data` thì bỏ key) |
| Lỗi | `{ "success": false, "error": { "code": "...", "message": "...", "details": [{ "field", "message" }] } }` |

Lỗi `errorHandler` tự nhận diện, không cần tự bắt:

| Lỗi gốc | HTTP | `code` |
| --- | --- | --- |
| `AppError` / `httpErrors.*` | theo lỗi | theo lỗi |
| `ZodError` | 400 | `VALIDATION_ERROR` |
| JSON body sai cú pháp | 400 | `INVALID_JSON` |
| JWT hết hạn | 401 | `TOKEN_EXPIRED` |
| JWT sai | 401 | `TOKEN_INVALID` |
| Mongo duplicate key (`11000`) | 409 | `DUPLICATE_KEY` |
| Route không tồn tại | 404 | `ROUTE_NOT_FOUND` |
| Lỗi khác | 500 | `INTERNAL_SERVER_ERROR` (có ghi log, không lộ chi tiết ra client) |

## Biến môi trường

- Backend chỉ đọc env qua `envConfig` (`backend/src/config/envConfig.js`), không gọi `process.env` rải rác.
- Biến để trống = dùng mặc định (`readEnv(key, default)`). Biến bắt buộc thêm vào `REQUIRED_KEYS`.
- Quy trình thêm biến: xem [02 — Muốn làm X](02-kien-truc.md#muốn-làm-x--sửa-ở-đâu).

## Model

- Dùng `schemaOptions` (`timestamps: true, versionKey: false`) từ `backend/src/config/schemaOptions.js`.
- Field nhạy cảm đặt `select: false` (vd `password`); cần thì lấy bằng `.select("+password")`.
- Trả user ra client qua hàm map field an toàn (`toPublicUser` trong `auth.service.js`), không trả document thô.

## Module mới

1. Tạo `backend/src/modules/<tên>/` với các file `<tên>.route.js`, `.schema.js`, `.controller.js`, `.service.js`, `.model.js`.
2. Route export dạng named (`export const <tên>Routes = Router()`), gắn ở `backend/src/routes/index.js`: `routes.use("/<tên>", <tên>Routes)`.
3. Kiểm tra: `curl -i http://localhost:8000/api/<tên>` không còn trả `404 ROUTE_NOT_FOUND`.

## Commit

Conventional Commits, message tiếng Anh: `feat(auth): ...`, `fix: ...`, `docs: ...`, `chore: ...`. Không commit `.env`. Root `.gitignore` chặn `.env` và `.env.*`, trừ `.env.example`.
