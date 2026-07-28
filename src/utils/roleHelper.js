import { USER_ROLES } from "../enums/userRoles";

export const ROLE_COLORS = Object.freeze({
  [USER_ROLES.ADMIN]: "volcano",
  [USER_ROLES.TEACHER]: "purple",
  [USER_ROLES.STUDENT]: "geekblue",
  [USER_ROLES.PARENT]: "green",
});

export const getRoleColor = (role) => {
  return ROLE_COLORS[role?.toLowerCase()] || "default";
};

export const formatRoleDisplay = (role) => {
  const roleMap = {
    [USER_ROLES.ADMIN]: "Administrator",
    [USER_ROLES.TEACHER]: "Teacher",
    [USER_ROLES.STUDENT]: "Student",
    [USER_ROLES.PARENT]: "Parent",
  };
  return roleMap[role?.toLowerCase()] || "User";
};
