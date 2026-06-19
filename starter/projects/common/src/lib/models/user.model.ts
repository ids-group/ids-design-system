// Example roles — replace with your app's roles.
export const USER_ROLES = {
  Admin: 'Admin',
  User: 'User',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
