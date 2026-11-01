// * Chỉ trả field an toàn cho client (không có password).
export function toPublicUser(user) {
  return {
    id: String(user._id),
    email: user.email,
    role: user.role,
    language: user.language,
    isVerify: user.isVerify,
    isBlocked: Boolean(user.isBlocked),
    blockedAt: user.isBlocked ?? null,
    createdAt: user.createdAt,
  };
}
