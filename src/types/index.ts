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

export type UserRole = 'admin' | 'manager' | 'host' | 'cohost' | 'cleaning_staff' | 'maintenance_staff';

export type DashboardWidget =
  | 'kpi_properties'
  | 'kpi_tasks'
  | 'kpi_expenses'
  | 'kpi_users'
  | 'chart_income'
  | 'chart_costs'
  | 'chart_margin'
  | 'table_tasks'
  | 'table_stays';

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
  dashboardWidgets?: DashboardWidget[];
  passwordHash?: string;  // PBKDF2-SHA256 hex; undefined = not yet set
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
  date: string;            // fecha de llegada (check-in)
  checkOut?: string;       // fecha de salida
  guestName?: string;      // nombre del huésped
  nights: number;
  nightlyRate?: number;    // tarifa por noche
  // El huésped pagó — breakdown
  guestTotal?: number;
  guestRoomTariff?: number;
  guestServiceFee?: number;
  guestOccupationTax?: number;
  // Tú ganas — breakdown
  hostTotal?: number;
  hostServiceFeeAmount?: number;
  lodgingTaxLiquidated?: number;
  ivaRetained?: number;
  isrRetained?: number;
  // Financial calculation fields
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
  calcMode?: 'TRADITIONAL' | 'MANUAL' | 'PFISICA' | 'SINDATOSFISCALES' | 'FUERASINFCTR' | 'FUERACONFCTR';
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

// ── Inventory ─────────────────────────────────────────────────────────────────
export interface InventoryCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface InventoryItem {
  id: string;
  categoryId: string;
  propertyId: string;
  name: string;
  quantity: number;
  unit?: string;
  notes?: string;
  createdAt: string;
}

// ── Custom Report Builder ─────────────────────────────────────────────────────
export interface ReportMetric {
  key: string;
  label: string;
  category: string;
  isPercent?: boolean;
}

export interface ReportRow {
  propertyId: string;
  propertyName: string;
  [key: string]: number | string;
}

export interface ReportConfig {
  selectedMetrics: ReportMetric[];
  propertyIds: string[];
  propertyNames: string[];
  periodLabel: string;
  vizType: 'table' | 'bar' | 'line' | 'pie';
}

// ── Airbnb Reviews ─────────────────────────────────────────────────────────────
export interface AirbnbReview {
  id: string;
  listingId: string;
  propertyName: string;
  rating: 5;
  comments: string;
  reviewerName: string;
  createdAt: string;
  language: string;
}

export interface AirbnbSession {
  token: string;
  savedAt: string;
}

export interface ReviewsState {
  reviews: AirbnbReview[];
  lastFetchedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

// ── Welcome Guide (new guide system) ─────────────────────────────────────────
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
  wifiNetwork: string;
  wifiPassword: string;
  hostName: string;
  hostPhone: string;
  hostEmail?: string;
  welcomeMessage: string;
  inclusions: string[];
  photos: string[];
  checkInTime: string;
  checkInNote: string;
  checkOutTime: string;
  checkOutNote: string;
  accessInstructions: string;
  googleMapsUrl: string;
  boilerInstructions: string[];
  trashInstructions: string;
  tvInstructions: string;
  additionalInstructions: string;
  amenities: string[];
  petsAllowed: boolean;
  eventsAllowed: boolean;
  smokingAllowed: boolean;
  additionalRules: string[];
  carbonMonoxideDetector: boolean;
  smokeDetector: boolean;
  securityCameras: boolean;
  checkoutSteps: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Property Guide (legacy) ───────────────────────────────────────────────────
export interface PropertyGuide {
  id: string;
  propertyId?: string;

  // Identification
  propertyName: string;
  propertyType: string;
  airbnbCustomLink?: string;
  address: string;
  mapsUrl?: string;
  description: string;

  // Images (base64 DataURL)
  logoDataUrl?: string;
  footerDataUrl?: string;
  imageDataUrls: string[];

  // Capacity
  bedrooms: number;
  bathrooms: number;
  beds: number;
  maxGuests: number;
  priceMin?: number;
  priceMax?: number;

  // Access
  checkinStart: string;
  checkinEnd: string;
  checkoutTime: string;
  checkinMethod: string;
  accessCode?: string;
  directions: string;

  // WiFi & Tech
  wifiNetwork: string;
  wifiPassword: string;
  tvNotes?: string;

  // Home Manual
  boilerNotes?: string;
  garbageNotes?: string;
  houseManualExtra?: string;

  // Amenities
  amenities: string[];

  // Rules
  petsAllowed: boolean;
  eventsAllowed: boolean;
  smokingAllowed: boolean;
  silenceHours?: string;
  additionalRules?: string;

  // Safety
  coMonoxideDetector: boolean;
  smokeAlarm: boolean;
  securityCamera: boolean;
  safetyNotes?: string;

  // Checkout
  checkoutInstructions: string[];

  // Contacts
  hostName?: string;
  hostPhone?: string;
  emergencyPhone?: string;
  cancellationPolicy?: string;

  // Meta
  createdAt: string;
  updatedAt: string;
}
