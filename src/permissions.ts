import type { UserRole, DashboardWidget } from './types';

export type PermResource =
  | 'users'
  | 'properties'
  | 'stays'
  | 'expenses'
  | 'tasks'
  | 'inventory'
  | 'reports'
  | 'guides'
  | 'roles';

export interface RolePermissions {
  canCreate: PermResource[];
  canEdit: PermResource[];
  canDelete: PermResource[];
  canView: PermResource[];
  canDownload: PermResource[];
  canConfigure: PermResource[];
  restrictions: {
    ownPropertiesOnly: boolean;
    noDelete: boolean;
    editTodayOnly: boolean;
    deleteTodayOnly: boolean;
    tasksOnly: boolean;
    ownTasksOnly: boolean;
  };
  visibleRoutes: string[];
  defaultWidgets: DashboardWidget[];
  availableWidgets: DashboardWidget[];
}

const ALL_RESOURCES: PermResource[] = ['users', 'properties', 'stays', 'expenses', 'tasks', 'inventory', 'reports', 'guides', 'roles'];

const ALL_WIDGETS: DashboardWidget[] = [
  'kpi_properties', 'kpi_tasks', 'kpi_expenses', 'kpi_users',
  'chart_income', 'chart_costs', 'chart_margin', 'table_tasks', 'table_stays',
];

const HOST_WIDGETS: DashboardWidget[] = [
  'kpi_properties', 'kpi_tasks', 'kpi_expenses',
  'chart_income', 'chart_costs', 'chart_margin', 'table_tasks', 'table_stays',
];

const STAFF_WIDGETS: DashboardWidget[] = ['kpi_tasks', 'table_tasks'];

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canCreate:    ALL_RESOURCES,
    canEdit:      ALL_RESOURCES,
    canDelete:    ALL_RESOURCES,
    canView:      ALL_RESOURCES,
    canDownload:  ALL_RESOURCES,
    canConfigure: ALL_RESOURCES,
    restrictions: {
      ownPropertiesOnly: false,
      noDelete: false,
      editTodayOnly: false,
      deleteTodayOnly: false,
      tasksOnly: false,
      ownTasksOnly: false,
    },
    visibleRoutes: ['/', '/propiedades', '/tareas', '/finanzas', '/inventario', '/reportes', '/usuarios', '/control-administrativo', '/guias'],
    defaultWidgets: ALL_WIDGETS,
    availableWidgets: ALL_WIDGETS,
  },

  manager: {
    canCreate:    ['properties', 'stays', 'expenses', 'tasks', 'inventory', 'reports'],
    canEdit:      [],
    canDelete:    [],
    canView:      ALL_RESOURCES,
    canDownload:  ['reports', 'stays', 'expenses'],
    canConfigure: ['reports'],
    restrictions: {
      ownPropertiesOnly: false,
      noDelete: true,
      editTodayOnly: false,
      deleteTodayOnly: false,
      tasksOnly: false,
      ownTasksOnly: false,
    },
    visibleRoutes: ['/', '/propiedades', '/tareas', '/finanzas', '/inventario', '/reportes', '/usuarios', '/control-administrativo', '/guias'],
    defaultWidgets: ALL_WIDGETS,
    availableWidgets: ALL_WIDGETS,
  },

  host: {
    canCreate:    ['properties', 'stays', 'tasks', 'inventory', 'reports'],
    canEdit:      ['properties', 'stays', 'tasks', 'inventory'],
    canDelete:    ['properties', 'stays', 'tasks', 'inventory'],
    canView:      ['properties', 'stays', 'tasks', 'inventory', 'reports'],
    canDownload:  ['reports'],
    canConfigure: ['reports'],
    restrictions: {
      ownPropertiesOnly: true,
      noDelete: false,
      editTodayOnly: true,
      deleteTodayOnly: true,
      tasksOnly: false,
      ownTasksOnly: false,
    },
    visibleRoutes: ['/', '/propiedades', '/tareas', '/inventario', '/reportes', '/guias'],
    defaultWidgets: HOST_WIDGETS,
    availableWidgets: HOST_WIDGETS,
  },

  cohost: {
    canCreate:    ['stays', 'expenses', 'tasks', 'inventory', 'reports'],
    canEdit:      ['stays', 'expenses', 'tasks', 'inventory'],
    canDelete:    ['stays', 'expenses', 'tasks', 'inventory'],
    canView:      ['properties', 'stays', 'expenses', 'tasks', 'inventory', 'reports'],
    canDownload:  ['reports'],
    canConfigure: ['reports'],
    restrictions: {
      ownPropertiesOnly: true,
      noDelete: false,
      editTodayOnly: true,
      deleteTodayOnly: false,
      tasksOnly: false,
      ownTasksOnly: false,
    },
    visibleRoutes: ['/', '/propiedades', '/tareas', '/inventario', '/reportes', '/guias'],
    defaultWidgets: HOST_WIDGETS,
    availableWidgets: HOST_WIDGETS,
  },

  maintenance_staff: {
    canCreate:    ['tasks'],
    canEdit:      ['tasks'],
    canDelete:    [],
    canView:      ['tasks', 'reports'],
    canDownload:  ['reports'],
    canConfigure: [],
    restrictions: {
      ownPropertiesOnly: true,
      noDelete: true,
      editTodayOnly: true,
      deleteTodayOnly: false,
      tasksOnly: true,
      ownTasksOnly: true,
    },
    visibleRoutes: ['/tareas', '/reportes'],
    defaultWidgets: STAFF_WIDGETS,
    availableWidgets: STAFF_WIDGETS,
  },

  cleaning_staff: {
    canCreate:    ['tasks'],
    canEdit:      ['tasks'],
    canDelete:    [],
    canView:      ['tasks', 'reports'],
    canDownload:  ['reports'],
    canConfigure: [],
    restrictions: {
      ownPropertiesOnly: true,
      noDelete: true,
      editTodayOnly: true,
      deleteTodayOnly: false,
      tasksOnly: true,
      ownTasksOnly: true,
    },
    visibleRoutes: ['/tareas', '/reportes'],
    defaultWidgets: STAFF_WIDGETS,
    availableWidgets: STAFF_WIDGETS,
  },
};

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr.startsWith(today);
}

export function isCurrentMonth(dateStr: string): boolean {
  const now = new Date();
  const d = new Date(dateStr);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
