import { envConfig } from "../../config/envConfig.js";
import { durationToMs } from "./duration.js";

export const COOKIE_NAMES = Object.freeze({
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
});

// * Refresh token chỉ gửi kèm request tới /api/auth (refresh, logout) → giảm bề mặt lộ token.
const REFRESH_COOKIE_PATH = "/api/auth";

function baseCookieOptions(path) {
  return {
    httpOnly: true, // * JS phía client không đọc được → chống XSS lấy token
    secure: envConfig.IS_PRODUCTION, // * production chỉ gửi qua HTTPS
    sameSite: "lax", // * chặn phần lớn CSRF, vẫn cho phép điều hướng thường
    path,
    ...(envConfig.COOKIE_DOMAIN && { domain: envConfig.COOKIE_DOMAIN }),
  };
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...baseCookieOptions("/"),
    maxAge: durationToMs(envConfig.JWT_ACCESS_EXPIRES_IN),
  });
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
    ...baseCookieOptions(REFRESH_COOKIE_PATH),
    maxAge: durationToMs(envConfig.JWT_REFRESH_EXPIRES_IN),
  });
}

// * clearCookie phải dùng đúng path/domain lúc set thì trình duyệt mới xoá.
export function clearAuthCookies(res) {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseCookieOptions("/"));
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseCookieOptions(REFRESH_COOKIE_PATH));
}
