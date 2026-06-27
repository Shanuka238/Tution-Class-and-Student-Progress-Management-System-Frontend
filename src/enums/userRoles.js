export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
  PARENT: "parent",
});

export const ROLE_VALUES = Object.values(USER_ROLES);

export const RELATIONSHIP_TYPES = Object.freeze({
  FATHER: "father",
  MOTHER: "mother",
  GUARDIAN: "guardian",
});

export const RELATIONSHIP_VALUES = Object.values(RELATIONSHIP_TYPES);

// Which dashboard each role lands on after login
export const ROLE_DASHBOARD = {
  [USER_ROLES.ADMIN]: "/admin/dashboard",
  [USER_ROLES.TEACHER]: "/teacher/dashboard",
  [USER_ROLES.STUDENT]: "/student/dashboard",
  [USER_ROLES.PARENT]: "/parent/dashboard",
};

// Default route (used when no specific dashboard match)
export const DEFAULT_DASHBOARD = "/admin/dashboard";
