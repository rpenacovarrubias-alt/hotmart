import { useAuth } from '../context/AuthContext';
import { ROLE_PERMISSIONS, isToday, isCurrentMonth, type PermResource } from '../permissions';
import type { DashboardWidget } from '../types';

export const usePermissions = () => {
  const { currentUser } = useAuth();

  const role = currentUser?.role ?? 'cleaning_staff';
  const perms = ROLE_PERMISSIONS[role];

  const canCreate = (resource: PermResource): boolean =>
    perms.canCreate.includes(resource);

  const canEdit = (resource: PermResource, dateStr?: string): boolean => {
    if (!perms.canEdit.includes(resource)) return false;
    if (perms.restrictions.editTodayOnly && dateStr) return isToday(dateStr);
    return true;
  };

  const canDelete = (resource: PermResource, dateStr?: string): boolean => {
    if (perms.restrictions.noDelete) return false;
    if (!perms.canDelete.includes(resource)) return false;
    if (perms.restrictions.deleteTodayOnly && dateStr) return isToday(dateStr);
    // cohost: no delete from previous months (but can delete current month)
    if (!perms.restrictions.deleteTodayOnly && dateStr) {
      return isCurrentMonth(dateStr);
    }
    return true;
  };

  const canView = (resource: PermResource): boolean =>
    perms.canView.includes(resource);

  const canDownload = (resource: PermResource): boolean =>
    perms.canDownload.includes(resource);

  const canConfigure = (resource: PermResource): boolean =>
    perms.canConfigure.includes(resource);

  const hasPropertyAccess = (propertyId: string): boolean => {
    if (!perms.restrictions.ownPropertiesOnly) return true;
    if (!currentUser) return false;
    // Empty array = all properties (admin/manager pattern)
    if (currentUser.propertyAccess.length === 0) return true;
    return currentUser.propertyAccess.includes(propertyId);
  };

  const isTasksOnly = (): boolean => perms.restrictions.tasksOnly;
  const isOwnTasksOnly = (): boolean => perms.restrictions.ownTasksOnly;

  const visibleRoutes: string[] = perms.visibleRoutes;

  const defaultWidgets: DashboardWidget[] = perms.defaultWidgets;
  const availableWidgets: DashboardWidget[] = perms.availableWidgets;

  const activeWidgets: DashboardWidget[] =
    currentUser?.dashboardWidgets ?? defaultWidgets;

  const isWidgetVisible = (widget: DashboardWidget): boolean =>
    activeWidgets.includes(widget);

  return {
    currentUser,
    role,
    canCreate,
    canEdit,
    canDelete,
    canView,
    canDownload,
    canConfigure,
    hasPropertyAccess,
    isTasksOnly,
    isOwnTasksOnly,
    visibleRoutes,
    defaultWidgets,
    availableWidgets,
    activeWidgets,
    isWidgetVisible,
  };
};
