import { User } from "../../modules/user/user.model.js";
import { ROLE_ACCESS_FIELDS } from "../../modules/role/role.model.js";
import { httpErrors } from "../errors/httpErrors.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { COOKIE_NAMES } from "../utils/authCookies.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { buildAccessContext } from "../utils/accessControl.js";

// * Ưu tiên cookie httpOnly (trình duyệt), fallback header "Authorization: Bearer <token>" (Postman, mobile).
function extractAccessToken(req) {
  const fromCookie = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (fromCookie) return fromCookie;

  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() === "bearer" && token) return token;

  return null;
}

// * Xác thực người dùng → gắn req.user = { id, email, access }.
// * access = { isSuperAdmin, roles, level, permissions: Set } — dùng cho authorize() và service.
// * Lỗi verify JWT (hết hạn / sai chữ ký) được errorHandler chuẩn hoá thành 401.
export async function authenticate(req, res, next) {
  const token = extractAccessToken(req);
  if (!token) throw httpErrors.unauthorized("Bạn chưa đăng nhập");

  const payload = verifyAccessToken(token);

  // * Truy vấn DB mỗi request → role / permission / trạng thái khoá luôn mới nhất,
  //   gỡ quyền có hiệu lực ngay (không nhét permission vào JWT).
  const user = await User.findById(payload.sub)
    .select("email roles isSuperAdmin isBlocked")
    .populate("roles", ROLE_ACCESS_FIELDS)
    .lean();
  if (!user)
    throw httpErrors.unauthorized(
      "Tài khoản không tồn tại",
      ERROR_CODES.TOKEN_INVALID,
    );
  if (user.isBlocked)
    throw httpErrors.forbidden(
      "Tài khoản đã bị khoá",
      ERROR_CODES.ACCOUNT_BLOCKED,
    );

  req.user = {
    id: String(user._id),
    email: user.email,
    access: buildAccessContext(user),
  };
  next();
}
