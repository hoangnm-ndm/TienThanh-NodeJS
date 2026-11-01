import z from "zod";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";
import { logger } from "../logger.js";

function normalizeError(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  if (err instanceof z.ZodError) {
    return {
      statusCode: 400,
      code: ERROR_CODES.VALIDATION_ERROR,
      message: "Dữ liệu không hợp lệ",
      details: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  // * TokenExpiredError kế thừa JsonWebTokenError → phải kiểm tra trước.
  if (err instanceof jwt.TokenExpiredError) {
    return {
      statusCode: 401,
      code: ERROR_CODES.TOKEN_EXPIRED,
      message: "Token đã hết hạn",
    };
  }

  if (err instanceof jwt.JsonWebTokenError) {
    return {
      statusCode: 401,
      code: ERROR_CODES.TOKEN_INVALID,
      message: "Token không hợp lệ",
    };
  }

  // * express.json() ném lỗi có type này khi body không phải JSON hợp lệ.
  if (err?.type === "entity.parse.failed") {
    return {
      statusCode: 400,
      code: ERROR_CODES.INVALID_JSON,
      message: "Body không phải JSON hợp lệ",
    };
  }

  // * MongoDB duplicate key (vd: 2 request đăng ký cùng email cùng lúc).
  if (err?.code === 11000) {
    return {
      statusCode: 409,
      code: ERROR_CODES.DUPLICATE_KEY,
      message: "Dữ liệu đã tồn tại",
      details: Object.keys(err.keyValue ?? {}).map((field) => ({
        field,
        message: `${field} đã tồn tại`,
      })),
    };
  }

  return {
    statusCode: 500,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    message: "Lỗi hệ thống, vui lòng thử lại sau",
  };
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  const { statusCode, code, message, details } = normalizeError(err);

  if (statusCode >= 500) {
    logger.error(
      { err, method: req.method, url: req.originalUrl },
      "Lỗi không xử lý được",
    );
  }
  res.status(statusCode).json({
    success: false,
    error: { code, message, ...(details?.length && { details }) },
  });
}
