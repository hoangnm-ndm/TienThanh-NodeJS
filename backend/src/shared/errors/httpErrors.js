import { AppError } from "./AppError.js";
import { ERROR_CODES } from "./errorCodes.js";

// * Factory tạo AppError theo HTTP status, tránh lặp { statusCode, code, message }.
export const httpErrors = {
  badRequest: (message = "Yêu cầu không hợp lệ", code = ERROR_CODES.VALIDATION_ERROR, details) =>
    new AppError({ statusCode: 400, code, message, details }),

  unauthorized: (message = "Bạn chưa đăng nhập", code = ERROR_CODES.UNAUTHORIZED) =>
    new AppError({ statusCode: 401, code, message }),

  forbidden: (message = "Bạn không có quyền thực hiện thao tác này", code = ERROR_CODES.FORBIDDEN) =>
    new AppError({ statusCode: 403, code, message }),

  notFound: (message = "Không tìm thấy tài nguyên", code = ERROR_CODES.ROUTE_NOT_FOUND) =>
    new AppError({ statusCode: 404, code, message }),

  conflict: (message = "Dữ liệu đã tồn tại", code = ERROR_CODES.DUPLICATE_KEY) =>
    new AppError({ statusCode: 409, code, message }),
};
