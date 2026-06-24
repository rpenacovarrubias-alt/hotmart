import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { mockProperties, mockTasks, mockExpenses, mockAdminControl, mockUsers } from '../data/mockData';
import type { Property, Task, TaskStatus, Expense, AdminControlRecord, AppUser, WelcomeGuide } from '../types';

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
  users: AppUser[];
  guides: WelcomeGuide[];

  // Property ops
  addProperty: (p: Property) => void;
  updateProperty: (p: Property) => void;
  deleteProperty: (id: string) => void;

  // Guide ops
  addGuide: (g: WelcomeGuide) => void;
  updateGuide: (g: WelcomeGuide) => void;
  deleteGuide: (id: string) => void;

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

  // User ops
  addUser: (u: AppUser) => void;
  updateUser: (u: AppUser) => void;
  toggleUserStatus: (id: string) => void;

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

// ── localStorage helpers ──────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

const KEYS = {
  properties:   'airbnb_properties',
  tasks:        'airbnb_tasks',
  expenses:     'airbnb_expenses',
  adminRecords: 'airbnb_adminRecords',
  users:        'airbnb_users',
  guides:       'airbnb_guides',
};

const defaultGuides: WelcomeGuide[] = [
  {
    id: 'guide_5',
    propertyId: '5',
    name: 'Casa de la Puerta Azul',
    type: 'casa',
    bedrooms: 4,
    beds: 4,
    bathrooms: 3,
    maxGuests: 8,
    location: 'Centro, Qro',
    address: 'Fray Francisco de Los Angeles 240, Quintas del Marques, 76047 Santiago de Querétaro, Qro.',
    airbnbUrl: 'airbnb.mx/h/casalapuertaazul',
    airbnbId: '56789012',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    wifiNetwork: 'INFINITUM56B6',
    wifiPassword: 'utHK9UGGTu',
    hostName: 'Ricardo (Co-anfitrión)',
    hostPhone: '442 185 1478',
    hostEmail: 'luis@example.com',
    welcomeMessage: 'Ubicación, Privacidad y Comodidad. A un costado del Estadio Corregidora con acceso a la Carretera 57 Mex-Qro y al Libramiento Fray Junípero Serra. Lugar tranquilo, seguro y cómodo, ideal tanto para trabajo como para descanso. Puedes llegar en tu auto o en camión – la casa se encuentra a tan solo 3 minutos de la terminal de autobuses TAQ.',
    inclusions: [
      'Cocina completa (refrigerador, horno, estufa)',
      'Detector de monóxido de carbono',
      'Estacionamiento gratuito en cochera (1 lugar)',
      'Televisión HD con Netflix',
      'WiFi de alta velocidad',
      'Área de trabajo con escritorio y enchufe'
    ],
    photos: [
      '/images/casa-puerta-azul/window-grapes.jpg',
      '/images/casa-puerta-azul/gate-door.jpg',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
    ],
    checkInTime: '3:00 p.m.',
    checkInNote: 'Hasta las 11:00 p.m.',
    checkOutTime: '12:00 p.m.',
    checkOutNote: 'Máximo',
    accessInstructions: 'Acceso autónomo mediante teclado digital (Keypad) en la puerta de entrada.',
    googleMapsUrl: 'https://maps.google.com/?q=Fray+Francisco+de+Los+Angeles+240,+Santiago+de+Querétaro',
    boilerInstructions: [
      'El boiler tiene el piloto encendido de manera permanente.',
      'Gira la perilla a la posición de "Encendido" cuando vayas a bañarte.',
      'Espera entre 10 y 15 minutos para que el agua se caliente por completo.',
      'Al salir de la propiedad, regresa siempre la perilla del boiler a la posición de "Piloto" para ahorrar gas y por seguridad.'
    ],
    trashInstructions: 'La basura la puedes depositar en los contenedores ubicados en el patio trasero de la casa. El camión recolector pasa de manera regular por la zona.',
    tvInstructions: 'La TV inteligente está configurada con las principales aplicaciones de streaming (Netflix, Disney+, Prime Video). Recuerda que deberás ingresar con tus cuentas personales y cerrarlas antes de tu salida.',
    additionalInstructions: 'Mantén las luces y los aparatos eléctricos apagados cuando te encuentres fuera del alojamiento. No dejes basura acumulada en el interior de la casa, colócala en el patio trasero antes de salir.',
    amenities: [
      'Cocina completa',
      'Detector de monóxido de carbono',
      'Estacionamiento (1 auto)',
      'Smart TV HD',
      'WiFi de alta velocidad',
      'Área de trabajo'
    ],
    petsAllowed: true,
    eventsAllowed: false,
    smokingAllowed: false,
    additionalRules: [
      'Mantén las luces y los aparatos eléctricos apagados cuando te encuentres fuera del alojamiento.',
      'No dejes basura acumulada en el interior de la casa, colócala en el patio trasero antes de salir.',
      'Al salir de la propiedad, no es necesario colocar cerraduras manuales extras adicionales; la cerradura digital inteligente se bloquea de manera autónoma.',
      'Asegúrate de mantener cerrados con llave los candados de los accesos exteriores.',
      'Recuerda volver la perilla del calentador (boiler) a la posición "Piloto" antes de tu salida.'
    ],
    carbonMonoxideDetector: true,
    smokeDetector: false,
    securityCameras: true,
    checkoutSteps: [
      'Apaga todas las luces de la casa.',
      'Apaga todos los aparatos eléctricos (TV, ventiladores, aire acondicionado, etc.).',
      'Regresa la perilla del boiler a la posición de "Piloto".',
      'Deja la basura en el patio trasero en bolsas cerradas.',
      'Asegúrate de que los candados exteriores queden cerrados correctamente.',
      'Cierra la puerta principal (no requiere seguro adicional).',
      'Comunica tu salida enviando un mensaje al anfitrión.'
    ],
    createdAt: '2026-06-24T00:00:00Z',
    updatedAt: '2026-06-24T00:00:00Z'
  },
  {
    id: 'guide_6',
    propertyId: '6',
    name: 'Casa 2Hab con A/C | cerca Pirámide',
    type: 'casa',
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    maxGuests: 2,
    location: 'Paseos del Bosque, Corregidora, Querétaro, México',
    address: 'Paseos del Bosque, Corregidora, Querétaro, México',
    airbnbUrl: 'www.airbnb.mx/rooms/1667036785999383762',
    airbnbId: '1667036785999383762',
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    wifiNetwork: 'Kuni',
    wifiPassword: 'Relax@33h.k',
    hostName: 'Co-Anfitrión Ricardo Peña C.',
    hostPhone: '4421851478',
    hostEmail: 'ricardo@example.com',
    welcomeMessage: 'Casa tranquila y equipada para trabajar o descansar. Espacio cómodo y silencioso ideal para trabajo remoto, parejas o familias pequeñas. Ubicada en Paseos del Bosque, a minutos de la Pirámide del Pueblito y 18 min del Centro. Lugar práctico, limpio y con buena energía.',
    inclusions: [
      '2 recámaras con cama matrimonial',
      'Aire acondicionado',
      'Smart TV 55" QLED',
      'Cocina completamente equipada',
      'Agua caliente',
      'UPS para internet y laptop',
      'Estacionamiento para 2 autos'
    ],
    photos: [
      '/images/casa-mora/photo1.jpg',
      '/images/casa-mora/photo2.jpg',
      '/images/casa-mora/photo3.jpg'
    ],
    checkInTime: '3:00 p.m.',
    checkInNote: 'hasta las 11:00 p.m.',
    checkOutTime: '12:00 p.m.',
    checkOutNote: 'Maximo',
    accessInstructions: 'A tu llegada por favor, notifica en la app de AIRBNB por mensaje y te abriremos enseguida el acceso vial. y para entrar a la propiedad. ya te habremos enviado tu código de apertura, con el que podrás tener acceso a la casa. Dentro de la casa encontrarás un llavero de control remoto para el acceso al condominio, con el podrás salir y entrar cuando lo requieras.',
    googleMapsUrl: 'https://maps.app.goo.gl/2sSTjeTdve22uyNXA',
    boilerInstructions: [
      'El Boiler es eléctrico y está conectado y prendido, puedes asegurarte que se encuentra encendido por la pantalla led con el indicador de la temperatura.',
      'si no lo está tiene el botón de encendido debajo de la pantalla.'
    ],
    trashInstructions: 'La basura la puedes dejar en los contenedores que se encuentran en el cuarto que se encuentra al lado de la puerta de acceso al condominio.',
    tvInstructions: 'Smart TV 55" QLED en la sala de estar.',
    additionalInstructions: 'Los focos del comedor, sala, y habitaciones tienen un control remoto para cambiar de intensidad y de color de luz Fría y Cálida. para que tu elijas el ambiente de esos espacios. El aire acondicionado funciona por horarios, solo se encuentra en el área del comedor y sala.',
    amenities: [
      '2 recámaras matrimoniales',
      'Aire acondicionado',
      'Smart TV 55" QLED',
      'Cocina equipada',
      'Calentador eléctrico',
      'UPS para módem',
      'Estacionamiento (2 autos)'
    ],
    petsAllowed: false,
    eventsAllowed: false,
    smokingAllowed: false,
    additionalRules: [
      'Debido a que la casa es para hospedaje y descanso, no se permiten las fiestas en la propiedad',
      'Asegurarse de dejar todo apagado la fecha de salida'
    ],
    carbonMonoxideDetector: true,
    smokeDetector: false,
    securityCameras: true,
    checkoutSteps: [
      'Dejar el llaver de acceso al condominio en la mesa',
      'Asegurarse de dejar todo apagado',
      'Solicitar la apertura del Portón.'
    ],
    createdAt: '2026-06-24T00:00:00Z',
    updatedAt: '2026-06-24T00:00:00Z'
  }
];

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties]       = useState<Property[]>          (() => load(KEYS.properties,   mockProperties));
  const [tasks, setTasks]                 = useState<Task[]>              (() => load(KEYS.tasks,         mockTasks));
  const [expenses, setExpenses]           = useState<Expense[]>           (() => load(KEYS.expenses,      mockExpenses));
  const [adminRecords, setAdminRecords]   = useState<AdminControlRecord[]>(() => load(KEYS.adminRecords,  mockAdminControl));
  const [users, setUsers]                 = useState<AppUser[]>           (() => load(KEYS.users,         mockUsers));
  const [guides, setGuides]               = useState<WelcomeGuide[]>      (() => load(KEYS.guides,        defaultGuides));

  // Persist every state to localStorage on change
  useEffect(() => { localStorage.setItem(KEYS.properties,   JSON.stringify(properties));   }, [properties]);
  useEffect(() => { localStorage.setItem(KEYS.tasks,        JSON.stringify(tasks));        }, [tasks]);
  useEffect(() => { localStorage.setItem(KEYS.expenses,     JSON.stringify(expenses));     }, [expenses]);
  useEffect(() => { localStorage.setItem(KEYS.adminRecords, JSON.stringify(adminRecords)); }, [adminRecords]);
  useEffect(() => { localStorage.setItem(KEYS.users,        JSON.stringify(users));        }, [users]);
  useEffect(() => { localStorage.setItem(KEYS.guides,       JSON.stringify(guides));       }, [guides]);

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

  // ── Guide ─────────────────────────────────────────────────────────────────
  const addGuide    = (g: WelcomeGuide) => setGuides(prev => [...prev, g]);
  const updateGuide = (g: WelcomeGuide) => setGuides(prev => prev.map(x => x.id === g.id ? g : x));
  const deleteGuide = (id: string)  => setGuides(prev => prev.filter(g => g.id !== id));

  // ── Task ─────────────────────────────────────────────────────────────────
  const addTask    = (t: Task) => setTasks(prev => [t, ...prev]);
  const updateTask = (t: Task) => setTasks(prev => prev.map(x => x.id === t.id ? t : x));
  const moveTask   = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    if (task && newStatus === 'Completado' && task.status !== 'Completado' && task.cost && task.cost > 0) {
      const catMap: Record<string, Expense['category']> = {
        Limpieza: 'cleaning', Mantenimiento: 'maintenance', 'Revisión': 'maintenance',
      };
      const expense: Expense = {
        id: `exp_task_${taskId}_${Date.now()}`,
        propertyId: task.propertyId,
        category: catMap[task.type] ?? 'other',
        description: `[Tarea] ${task.title}`,
        amount: task.cost,
        date: new Date().toISOString().split('T')[0],
        createdBy: task.assignedTo,
        createdAt: new Date().toISOString(),
      };
      setExpenses(prev => [expense, ...prev]);
    }
  };
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

  // ── User ──────────────────────────────────────────────────────────────────
  const addUser          = (u: AppUser) => setUsers(prev => [...prev, u]);
  const updateUser       = (u: AppUser) => setUsers(prev => prev.map(x => x.id === u.id ? u : x));
  const toggleUserStatus = (id: string) =>
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));

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
      properties, tasks, expenses, adminRecords, users, guides,
      addProperty, updateProperty, deleteProperty,
      addGuide, updateGuide, deleteGuide,
      addTask, updateTask, moveTask, deleteTask,
      addExpense, updateExpense, deleteExpense,
      updateAdminRecord, deleteAdminRecord,
      addUser, updateUser, toggleUserStatus,
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
