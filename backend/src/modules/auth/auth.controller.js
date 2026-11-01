import { authService } from "./auth.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { COOKIE_NAMES, clearAuthCookies, setAuthCookies } from "../../shared/utils/authCookies.js";

// * Thông tin thiết bị gắn vào session (phục vụ quản lý phiên đăng nhập sau này).
function getClientContext(req) {
  return {
    userAgent: req.get("user-agent")?.slice(0, 500) ?? null,
    ip: req.ip ?? null,
  };
}

// * Controller chỉ: lấy input đã validate → gọi service → set cookie / trả response.
export const authController = {
  register: async (req, res) => {
    const user = await authService.register(req.validated.body);
    return sendSuccess(res, {
      statusCode: 201,
      message: "Đăng ký thành công, vui lòng kiểm tra email",
      data: user,
    });
  },

  login: async (req, res) => {
    const { user, accessToken, refreshToken } = await authService.login(
      req.validated.body,
      getClientContext(req),
    );
    setAuthCookies(res, { accessToken, refreshToken });
    // * Token chỉ nằm trong cookie httpOnly, không trả trong body.
    return sendSuccess(res, { message: "Đăng nhập thành công", data: user });
  },

  refreshToken: async (req, res) => {
    const tokens = await authService.refreshToken(
      req.validated.cookies.refreshToken,
      getClientContext(req),
    );
    setAuthCookies(res, tokens);
    return sendSuccess(res, { message: "Làm mới phiên đăng nhập thành công" });
  },

  logout: async (req, res) => {
    await authService.logout(req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN]);
    clearAuthCookies(res);
    return sendSuccess(res, { message: "Đăng xuất thành công" });
  },

  me: async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return sendSuccess(res, { message: "Lấy thông tin thành công", data: user });
  },

  forgotPassword: async (req, res) => {},
  resetPassword: async (req, res) => {},
};
