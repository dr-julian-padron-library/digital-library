/**
 * User Roles and Capabilities
 * 
 * Centralized permission registry that treats roles as keys to capability sets.
 */

export type AppRole = 'ADMIN' | 'LIBRARIAN' | 'USER';

export enum Capability {
  VIEW_ROOMS = 'VIEW_ROOMS',
  MANAGE_ROOMS = 'MANAGE_ROOMS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_CONTENT = 'MANAGE_CONTENT',
  MANAGE_LOANS = 'MANAGE_LOANS',
}

export const ROLE_PERMISSIONS: Record<AppRole, Capability[]> = {
  ADMIN: Object.values(Capability),
  LIBRARIAN: [Capability.VIEW_ROOMS, Capability.MANAGE_ROOMS, Capability.MANAGE_CONTENT, Capability.MANAGE_LOANS],
  USER: [Capability.VIEW_ROOMS],
};

/**
 * Check if a role has a specific capability
 */
export const hasCapability = (role: AppRole | null, cap: Capability): boolean =>
  role ? ROLE_PERMISSIONS[role]?.includes(cap) ?? false : false;

/**
 * Get all capabilities for a role
 */
export const getCapabilities = (role: AppRole | null): Capability[] =>
  role ? ROLE_PERMISSIONS[role] ?? [] : [];
