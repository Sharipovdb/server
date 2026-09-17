export const RoleName = {
  Admin: 'Admin',
  RouteManager: 'RouteManager',
  CrewLead: 'CrewLead',
  DriverLead: 'DriverLead',
  Worker: 'Worker',
  Accountant: 'Accountant',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const ALL_ROLE_NAMES: readonly RoleName[] = Object.values(RoleName);
