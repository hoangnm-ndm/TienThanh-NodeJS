import z from "zod";
import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { ERROR_CODES } from "../errors/errorCodes.js";

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
  // if(err instanceof jwt)
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
