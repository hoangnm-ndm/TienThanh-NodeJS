import { User } from "../../modules/user/user.model.js";
import { httpErrors } from "../errors/httpErrors.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { COOKIE_NAMES } from "../utils/authCookies.js";
import { verifyAccessToken } from "../utils/jwt.js";

// * Ưu tiên cookie httpOnly (trình duyệt), fallback header "Authorization: Bearer <token>" (Postman, mobile).
function extractAccessToken(req) {
  const fromCookie = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (fromCookie) return fromCookie;

  const [scheme, token] = req.headers.authorization?.split(" ") ?? [];
  if (scheme?.toLowerCase() === "bearer" && token) return token;

  return null;
}

// * Xác thực người dùng → gắn req.user = { id, email, role }.
// * Lỗi verify JWT (hết hạn / sai chữ ký) được errorHandler chuẩn hoá thành 401.
export async function authenticate(req, res, next) {
  const token = extractAccessToken(req);
  if (!token) throw httpErrors.unauthorized("Bạn chưa đăng nhập");

  const payload = verifyAccessToken(token);

  // * Truy vấn DB để role / trạng thái khoá luôn mới nhất (không tin hoàn toàn vào payload cũ).
  const user = await User.findById(payload.sub).select("email role isBlocked").lean();
  if (!user) throw httpErrors.unauthorized("Tài khoản không tồn tại", ERROR_CODES.TOKEN_INVALID);
  if (user.isBlocked) throw httpErrors.forbidden("Tài khoản đã bị khoá", ERROR_CODES.ACCOUNT_BLOCKED);

  req.user = { id: String(user._id), email: user.email, role: user.role };
  next();
}
