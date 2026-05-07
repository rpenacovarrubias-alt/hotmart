import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockProperties, mockTasks, mockExpenses, mockAdminControl } from '../data/mockData';
import type { Property, Task, TaskStatus, Expense, AdminControlRecord } from '../types';

// ── Delete modal ──────────────────────────────────────────────────────────────
export type DeleteCategory = 'propiedad' | 'gasto' | 'tarea' | 'reporte';

export interface DeletePreselect {
  category: DeleteCategory;
  itemId: string;
  fromInline: boolean;
}

// ── Edit modal ────────────────────────────────────────────────────────────────
export type EditCategory = 'propiedad' | 'gasto' | 'tarea' | 'reporte';

export interface EditPreselect {
  category: EditCategory;
  itemId: string;
}

// ── Context type ──────────────────────────────────────────────────────────────
interface AppContextType {
  // Data
  properties: Property[];
  tasks: Task[];
  expenses: Expense[];
  adminRecords: AdminControlRecord[];

  // Property ops
  addProperty: (p: Property) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;

  // Task ops
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  deleteTask: (id: string) => void;

  // Expense ops
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;

  // Admin-record ops
  updateAdminRecord: (r: AdminControlRecord) => void;
  deleteAdminRecord: (id: string) => void;

  // Delete modal
  deleteModalOpen: boolean;
  deleteModalPreselect: DeletePreselect | null;
  openDeleteModal: (preselect?: Omit<DeletePreselect, 'fromInline'>) => void;
  closeDeleteModal: () => void;

  // Edit modal
  editModalOpen: boolean;
  editModalPreselect: EditPreselect | null;
  openEditModal: (preselect?: EditPreselect) => void;
  closeEditModal: () => void;

  // Toast
  toast: string | null;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties]     = useState<Property[]>(mockProperties);
  const [tasks, setTasks]               = useState<Task[]>(mockTasks);
  const [expenses, setExpenses]         = useState<Expense[]>(mockExpenses);
  const [adminRecords, setAdminRecords] = useState<AdminControlRecord[]>(mockAdminControl);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen]           = useState(false);
  const [deleteModalPreselect, setDeleteModalPreselect] = useState<DeletePreselect | null>(null);

  // Edit modal state
  const [editModalOpen, setEditModalOpen]           = useState(false);
  const [editModalPreselect, setEditModalPreselect] = useState<EditPreselect | null>(null);

  // Toast state
  const [toast, setToast] = useState<string | null>(null);

  // ── Property ──────────────────────────────────────────────────────────────
  const addProperty    = (p: Property) => setProperties(prev => [...prev, p]);
  const updateProperty = (p: Property) => setProperties(prev => prev.map(x => x.id === p.id ? p : x));
  const deleteProperty = (id: string)  => setProperties(prev => prev.filter(p => p.id !== id));

  // ── Task ─────────────────────────────────────────────────────────────────
  const addTask    = (t: Task) => setTasks(prev => [t, ...prev]);
  const updateTask = (t: Task) => setTasks(prev => prev.map(x => x.id === t.id ? t : x));
  const moveTask   = (taskId: string, newStatus: TaskStatus) =>
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  // ── Expense ───────────────────────────────────────────────────────────────
  const addExpense    = (e: Expense) => setExpenses(prev => [e, ...prev]);
  const updateExpense = (e: Expense) => setExpenses(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(e => e.id !== id));

  // ── Admin record ──────────────────────────────────────────────────────────
  const updateAdminRecord = (r: AdminControlRecord) =>
    setAdminRecords(prev => prev.map(x => x.id === r.id ? r : x));
  const deleteAdminRecord = (id: string) =>
    setAdminRecords(prev => prev.filter(r => r.id !== id));

  // ── Delete modal ──────────────────────────────────────────────────────────
  const openDeleteModal = (preselect?: Omit<DeletePreselect, 'fromInline'>) => {
    setDeleteModalPreselect(preselect ? { ...preselect, fromInline: true } : null);
    setDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteModalPreselect(null);
  };

  // ── Edit modal ────────────────────────────────────────────────────────────
  const openEditModal = (preselect?: EditPreselect) => {
    setEditModalPreselect(preselect ?? null);
    setEditModalOpen(true);
  };
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditModalPreselect(null);
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <AppContext.Provider value={{
      properties, tasks, expenses, adminRecords,
      addProperty, updateProperty, deleteProperty,
      addTask, updateTask, moveTask, deleteTask,
      addExpense, updateExpense, deleteExpense,
      updateAdminRecord, deleteAdminRecord,
      deleteModalOpen, deleteModalPreselect, openDeleteModal, closeDeleteModal,
      editModalOpen, editModalPreselect, openEditModal, closeEditModal,
      toast, showToast,
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
