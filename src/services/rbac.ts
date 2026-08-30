import { NavTab } from '../types';

/**
 * Role → allowed navigation tabs. Mirrors the SOURCE project's RBAC rules,
 * mapped onto the TARGET tab set. The backend also guards protected operations;
 * this only controls what a user can navigate to (defense-in-depth, not the
 * only line of defense).
 */
export const RBAC_TABS: Record<string, NavTab[]> = {
  patient: ['family-portal'],
  nurse: ['overview', 'ward-dashboard', 'care-tasks', 'patient-360', 'medication-safety', 'bed-management', 'family-portal'],
  doctor: ['overview', 'ward-dashboard', 'care-tasks', 'patient-360', 'medication-safety', 'bed-management', 'family-portal', 'analytics'],
  admin: ['overview', 'ward-dashboard', 'care-tasks', 'patient-360', 'medication-safety', 'bed-management', 'family-portal', 'analytics', 'administration'],
};

export function tabsForRole(role: string | undefined): NavTab[] {
  if (!role) return RBAC_TABS.nurse;
  return RBAC_TABS[role.toLowerCase()] || RBAC_TABS.nurse;
}
