// * Chuẩn hoá response thành công: { success, message, data }.
export function sendSuccess(res, { statusCode = 200, message = "Thành công", data } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data }),
  });
}
