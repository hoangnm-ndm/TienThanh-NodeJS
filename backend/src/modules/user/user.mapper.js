// * Role trả ra client: { id, name, level } nếu đã populate, chỉ id nếu chưa.
function toPublicRole(role) {
  return role?.name
    ? { id: String(role._id), name: role.name, level: role.level }
    : { id: String(role) };
}

// * Chỉ trả field an toàn cho client (không có password).
// * access (tuỳ chọn) = buildAccessContext(user) → thêm level + permissions (dùng cho /me).
export function toPublicUser(user, access) {
  return {
    id: String(user._id),
    email: user.email,
    roles: (user.roles ?? []).filter(Boolean).map(toPublicRole),
    isSuperAdmin: Boolean(user.isSuperAdmin),
    language: user.language,
    isVerify: user.isVerify,
    isBlocked: Boolean(user.isBlocked),
    blockedAt: user.isBlocked ?? null,
    createdAt: user.createdAt,
    ...(access && {
      level: Number.isFinite(access.level) ? access.level : null,
      permissions: [...access.permissions].sort(),
    }),
  };
}
