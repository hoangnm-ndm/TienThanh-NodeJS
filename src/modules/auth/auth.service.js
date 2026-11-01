import { User } from "../user/user.model.js";
import { sessionService } from "../session/session.service.js";
import { httpErrors } from "../../shared/errors/httpErrors.js";
import { ERROR_CODES } from "../../shared/errors/errorCodes.js";
import { comparePassword, hashPassword, hashToken } from "../../shared/utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt.js";

// * Chỉ trả field an toàn cho client.
function toPublicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    language: user.language,
    isVerify: user.isVerify,
    createdAt: user.createdAt,
  };
}

function assertNotBlocked(user) {
  if (user.isBlocked) throw httpErrors.forbidden("Tài khoản đã bị khoá", ERROR_CODES.ACCOUNT_BLOCKED);
}

function signTokenPair({ user, sessionId }) {
  return {
    accessToken: signAccessToken({ userId: user._id, role: user.role }),
    refreshToken: signRefreshToken({ userId: user._id, sessionId }),
  };
}

const invalidRefreshToken = () =>
  httpErrors.unauthorized("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại", ERROR_CODES.TOKEN_INVALID);

export const authService = {
  register: async ({ email, password }) => {
    const userExist = await User.exists({ email });
    if (userExist) throw httpErrors.conflict("Email đã được sử dụng", ERROR_CODES.EMAIL_ALREADY_EXISTS);

    const newUser = await User.create({ email, password: await hashPassword(password) });
    // TODO: service mail (verify email)
    return toPublicUser(newUser);
  },

  // * context = { userAgent, ip } — lưu theo session để sau này quản lý thiết bị.
  login: async ({ email, password }, context) => {
    const user = await User.findOne({ email }).select("+password");

    // * Cùng 1 thông báo cho "sai email" và "sai mật khẩu" → không lộ email nào đã đăng ký.
    const isMatch = user?.password && (await comparePassword(password, user.password));
    if (!isMatch) throw httpErrors.unauthorized("Email hoặc mật khẩu không đúng", ERROR_CODES.INVALID_CREDENTIALS);
    assertNotBlocked(user);

    const sessionId = sessionService.newId();
    const tokens = signTokenPair({ user, sessionId });
    await sessionService.create({ sessionId, userId: user._id, refreshToken: tokens.refreshToken, ...context });

    return { user: toPublicUser(user), ...tokens };
  },

  // * Refresh token rotation: cấp cặp token mới, token cũ hết hiệu lực ngay.
  refreshToken: async (refreshToken, context) => {
    const payload = verifyRefreshToken(refreshToken);

    const session = await sessionService.findActiveById(payload.sid);
    if (!session || String(session.userId) !== payload.sub) throw invalidRefreshToken();

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

  getMe: async (userId) => {
    const user = await User.findById(userId);
    if (!user) throw httpErrors.notFound("Không tìm thấy người dùng");
    return toPublicUser(user);
  },
};
