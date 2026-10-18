import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";

export function notFoundError(req, res, next) {
  next(
    new AppError({
      statusCode: 404,
      code: ERROR_CODES.ROUTE_NOT_FOUND,
      message: `Khong tim thay duong dan ${(req, method)}: ${req.orginalUrl}`,
    }),
  );
}
