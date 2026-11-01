export const ROLES = Object.freeze({
  SUPER_ADMIN: "superAdmin",
  ADMIN: "admin",
  MEMBER: "member",
});

// * Cấp bậc role: số lớn hơn = quyền cao hơn.
export const ROLE_LEVEL = Object.freeze({
  [ROLES.MEMBER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3,
});

// * actorRole có cấp cao hơn hẳn targetRole không (bằng cấp → false).
export function isHigherRole(actorRole, targetRole) {
  return (ROLE_LEVEL[actorRole] ?? 0) > (ROLE_LEVEL[targetRole] ?? 0);
}

// * Các role thấp hơn hẳn role cho trước, vd rolesBelow("admin") → ["member"].
export function rolesBelow(role) {
  return Object.values(ROLES).filter((r) => isHigherRole(role, r));
}

// * Role superAdmin được phép gán cho người khác (không gồm superAdmin: hệ thống chỉ có 1).
export const ASSIGNABLE_ROLES = Object.freeze([ROLES.ADMIN, ROLES.MEMBER]);
