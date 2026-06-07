import { useAuthStore } from '../stores/auth.store';

export function usePermission() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const permissions = useAuthStore((state) => state.permissions);

  return {
    hasPermission,
    canView: (resource: string) => hasPermission(resource, 'view'),
    canCreate: (resource: string) => hasPermission(resource, 'create'),
    canEdit: (resource: string) => hasPermission(resource, 'edit'),
    canDelete: (resource: string) => hasPermission(resource, 'delete'),
    canApprove: (resource: string) => hasPermission(resource, 'approve'),
    canExport: (resource: string) => hasPermission(resource, 'export'),
    permissions,
  };
}
