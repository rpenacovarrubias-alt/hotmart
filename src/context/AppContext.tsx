import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockProperties, mockTasks, mockExpenses, mockAdminControl } from '../data/mockData';
import type { Property, Task, TaskStatus, Expense, AdminControlRecord } from '../types';

export type DeleteCategory = 'propiedad' | 'gasto' | 'tarea' | 'reporte';

export interface DeletePreselect {
  category: DeleteCategory;
  itemId: string;
  fromInline: boolean;
}

interface AppContextType {
  // ── Data ──────────────────────────────────────────────
  properties: Property[];
  tasks: Task[];
  expenses: Expense[];
  adminRecords: AdminControlRecord[];

  // ── Property ops ──────────────────────────────────────
  addProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;

  // ── Task ops ──────────────────────────────────────────
  addTask: (t: Task) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // ── Expense ops ───────────────────────────────────────
  addExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;

  // ── Admin-record ops ──────────────────────────────────
  deleteAdminRecord: (id: string) => void;

  // ── Delete modal ──────────────────────────────────────
  deleteModalOpen: boolean;
  deleteModalPreselect: DeletePreselect | null;
  openDeleteModal: (preselect?: Omit<DeletePreselect, 'fromInline'>) => void;
  closeDeleteModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties]   = useState<Property[]>(mockProperties);
  const [tasks, setTasks]             = useState<Task[]>(mockTasks);
  const [expenses, setExpenses]       = useState<Expense[]>(mockExpenses);
  const [adminRecords, setAdminRecords] = useState<AdminControlRecord[]>(mockAdminControl);

  const [deleteModalOpen, setDeleteModalOpen]         = useState(false);
  const [deleteModalPreselect, setDeleteModalPreselect] = useState<DeletePreselect | null>(null);

  // Property
  const addProperty    = (p: Property)  => setProperties(prev => [...prev, p]);
  const deleteProperty = (id: string)   => setProperties(prev => prev.filter(p => p.id !== id));

  // Task
  const addTask  = (t: Task)                              => setTasks(prev => [t, ...prev]);
  const moveTask = (taskId: string, newStatus: TaskStatus) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  // Expense
  const addExpense    = (e: Expense) => setExpenses(prev => [e, ...prev]);
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  // Admin record
  const deleteAdminRecord = (id: string) =>
    setAdminRecords(prev => prev.filter(r => r.id !== id));

  // Modal
  const openDeleteModal = (preselect?: Omit<DeletePreselect, 'fromInline'>) => {
    setDeleteModalPreselect(preselect ? { ...preselect, fromInline: true } : null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteModalPreselect(null);
  };

  return (
    <AppContext.Provider value={{
      properties, tasks, expenses, adminRecords,
      addProperty, deleteProperty,
      addTask, moveTask, deleteTask,
      addExpense, deleteExpense,
      deleteAdminRecord,
      deleteModalOpen, deleteModalPreselect,
      openDeleteModal, closeDeleteModal,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
