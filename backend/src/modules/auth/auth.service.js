import { User } from "../user/user.model.js";
import { toPublicUser } from "../user/user.mapper.js";
import { ROLE_ACCESS_FIELDS } from "../role/role.model.js";
import { roleService } from "../role/role.service.js";
import { sessionService } from "../session/session.service.js";
import { httpErrors } from "../../shared/errors/httpErrors.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import {
  comparePassword,
  hashPassword,
  hashToken,
} from "../../shared/utils/hash.js";
import { buildAccessContext } from "../../shared/utils/accessControl.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../shared/utils/jwt.js";

function assertNotBlocked(user) {
  if (user.isBlocked)
    throw httpErrors.forbidden(
      "Tài khoản đã bị khoá",
      ERROR_CODES.ACCOUNT_BLOCKED,
    );
}

function signTokenPair({ user, sessionId }) {
  return {
    accessToken: signAccessToken({ userId: user._id }),
    refreshToken: signRefreshToken({ userId: user._id, sessionId }),
  };
}

const invalidRefreshToken = () =>
  httpErrors.unauthorized(
    "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại",
    ERROR_CODES.TOKEN_INVALID,
  );

export const authService = {
  register: async ({ email, password }) => {
    const userExist = await User.exists({ email });
    if (userExist)
      throw httpErrors.conflict(
        "Đã có lỗi xảy ra",
        ERROR_CODES.EMAIL_ALREADY_REGISTERED,
      );

    // * User mới nhận role mặc định (member).
    const defaultRole = await roleService.getDefaultRole();
    const newUser = await User.create({
      email,
      password: await hashPassword(password),
      roles: [defaultRole._id],
    });
    await newUser.populate("roles", ROLE_ACCESS_FIELDS);
    // TODO: service mail (verify email)
    return toPublicUser(newUser);
  },

  // * context = { userAgent, ip } — lưu theo session để sau này quản lý thiết bị.
  login: async ({ email, password }, context) => {
    const user = await User.findOne({ email })
      .select("+password")
      .populate("roles", ROLE_ACCESS_FIELDS);

    // * Cùng 1 thông báo cho "sai email" và "sai mật khẩu" → không lộ email nào đã đăng ký.
    const isMatch =
      user?.password && (await comparePassword(password, user.password));
    if (!isMatch)
      throw httpErrors.unauthorized(
        "Email hoặc mật khẩu không đúng",
        ERROR_CODES.INVALID_CREDENTIALS,
      );
    assertNotBlocked(user);

    const sessionId = sessionService.newId();
    const tokens = signTokenPair({ user, sessionId });
    await sessionService.create({
      sessionId,
      userId: user._id,
      refreshToken: tokens.refreshToken,
      ...context,
    });

    return { user: toPublicUser(user, buildAccessContext(user)), ...tokens };
  },

  // * Refresh token rotation: cấp cặp token mới, token cũ hết hiệu lực ngay.
  refreshToken: async (refreshToken, context) => {
    const payload = verifyRefreshToken(refreshToken);

    const session = await sessionService.findActiveById(payload.sid);
    if (!session || String(session.userId) !== payload.sub)
      throw invalidRefreshToken();

    // * Token hợp lệ chữ ký nhưng không phải token hiện hành → đã bị dùng lại (có thể bị đánh cắp)
    //   → thu hồi cả phiên, buộc đăng nhập lại.
    if (session.tokenHash !== hashToken(refreshToken)) {
      await sessionService.revoke(session._id);
      throw httpErrors.unauthorized(
        "Phát hiện refresh token bị dùng lại, vui lòng đăng nhập lại",
        ERROR_CODES.TOKEN_REUSED,
      );
    }

    const user = await User.findById(payload.sub);
    if (!user) throw invalidRefreshToken();
    if (user.isBlocked) {
      await sessionService.revoke(session._id);
      assertNotBlocked(user);
    }

    const tokens = signTokenPair({ user, sessionId: session._id });
    const rotated = await sessionService.rotate({
      sessionId: session._id,
      oldToken: refreshToken,
      newToken: tokens.refreshToken,
      ...context,
    });
    // * Thua race với 1 request refresh khác cùng lúc.
    if (!rotated) throw invalidRefreshToken();

    return tokens;
  },

  // * Idempotent: token thiếu / sai / hết hạn vẫn coi như đã đăng xuất.
  logout: async (refreshToken) => {
    if (!refreshToken) return;
    try {
      const payload = verifyRefreshToken(refreshToken);
      await sessionService.revoke(payload.sid);
    } catch {
      // * Token không verify được → không có phiên nào để thu hồi.
    }
  },

  // * Kèm level + permissions để frontend ẩn / hiện chức năng (server vẫn kiểm tra thật).
  getMe: async (userId) => {
    const user = await User.findById(userId).populate("roles", ROLE_ACCESS_FIELDS);
    if (!user) throw httpErrors.notFound("Không tìm thấy người dùng");
    return toPublicUser(user, buildAccessContext(user));
  },
};
