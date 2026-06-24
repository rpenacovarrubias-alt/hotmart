export interface Property {
  id: string;
  name: string;
  role: 'cohost' | 'host';
  type: 'casa' | 'departamento' | 'loft' | 'hotel' | 'villa' | 'suite' | 'habitación';
  description?: string;
  imageUrl: string;
  gallery: string[];
  location: string;
  hostName: string;
  hostPhone: string;
  hostEmail: string;
  cleaningFee: number;
  commissionRate: number;
  maintenanceFee: number;
  pricePerNight: number;

  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  sqft: number;
  parking: boolean;
  pool: boolean;
  petFriendly: boolean;

  airbnbUrl: string;
  airbnbId: string;
  status: 'activo' | 'inactivo' | 'mantenimiento';
}

export type TaskStatus = 'Pendiente' | 'En Progreso' | 'Completado';
export type TaskType = 'Limpieza' | 'Mantenimiento' | 'Revisión' | 'Otro';

export interface Task {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  status: TaskStatus;
  type: TaskType;
  assignedTo: string;
  date: string;
  photos: string[];
  priority?: 'Normal' | 'Urgente';
  cost?: number;
}

export type UserRole = 'admin' | 'manager' | 'host' | 'cleaning_staff' | 'maintenance_staff';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  propertyAccess: string[];
  avatarUrl?: string;
  status: 'active' | 'inactive';
  lastLogin?: string;
  createdAt: string;
}

export type ExpenseCategory = 'cleaning' | 'maintenance' | 'supplies' | 'platform_fee' | 'utilities' | 'repairs' | 'other';

export interface Expense {
  id: string;
  propertyId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  paymentMethod?: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  createdBy: string;
  createdAt: string;
}

export interface Income {
  id: string;
  propertyId: string;
  date: string;
  grossIncome: number;
  cohostCommission: number;
  ownerNet: number;
}

export interface PropertyConfig {
  id: string;
  propertyId: string;
  ownerName: string;
  cohostName: string;
  nightlyRate: number;
  airbnbCommission: number;
  cleaningFee: number;
  cohostCommission: number;
  minNights: number;
  incomeMode: 'BEFORE' | 'AFTER';
}

export interface Stay {
  id: string;
  propertyId: string;
  stayNumber: number;
  date: string;
  nights: number;
  registeredIncome: number;
  incomeMode: 'BEFORE' | 'AFTER';
  airbnbCommission: number;
  afterAirbnb: number;
  cleaningFee: number;
  subtotal: number;
  cohostCommission: number;
  extraExpenses: number;
  netProfit: number;
  notes?: string;
}

export interface ExtraExpense {
  id: string;
  propertyId: string;
  date: string;
  description: string;
  amount: number;
  stayId?: string;
}

export interface AdminControlRecord {
  id: string;
  property_id: string;
  property_name: string;
  period: string;
  month: number;
  year: number;
  airbnb_income: number;
  cleaning_cost: number;
  airbnb_commission: number;
  total_cost: number;
  profit: number;
  margin_percent: number;
  reportLabel?: string;
  notes?: string;
  periodType?: 'Semanal' | 'Mensual' | 'Trimestral' | 'Anual';
}

export interface WelcomeGuide {
  id: string;
  propertyId?: string;
  name: string;
  type: string;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  maxGuests: number;
  location: string;
  address: string;
  airbnbUrl: string;
  airbnbId: string;
  imageUrl: string;
  
  // WiFi
  wifiNetwork: string;
  wifiPassword: string;
  
  // Contact
  hostName: string;
  hostPhone: string;
  hostEmail?: string;
  
  // Welcome & Inclusions
  welcomeMessage: string;
  inclusions: string[];
  photos: string[]; // 3 fotos de galería
  
  // Access
  checkInTime: string;
  checkInNote: string;
  checkOutTime: string;
  checkOutNote: string;
  accessInstructions: string;
  googleMapsUrl: string;
  
  // Manuals
  boilerInstructions: string[];
  trashInstructions: string;
  tvInstructions: string;
  additionalInstructions: string;
  
  // Amenities
  amenities: string[];
  
  // Rules
  petsAllowed: boolean;
  eventsAllowed: boolean;
  smokingAllowed: boolean;
  additionalRules: string[];
  
  // Security
  carbonMonoxideDetector: boolean;
  smokeDetector: boolean;
  securityCameras: boolean;
  
  // Checkout
  checkoutSteps: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

