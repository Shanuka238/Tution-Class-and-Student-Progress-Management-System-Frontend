import { USER_ROLES } from "../enums/userRoles";

export const formatRoleDisplay = (role) => {
  const roleMap = {
    [USER_ROLES.ADMIN]: "Administrator",
    [USER_ROLES.TEACHER]: "Teacher",
    [USER_ROLES.STUDENT]: "Student",
    [USER_ROLES.PARENT]: "Parent",
  };
  return roleMap[role] || "User";
};
