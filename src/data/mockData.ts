import type { Property, Task, AppUser, Expense, Income, PropertyConfig, Stay, ExtraExpense, AdminControlRecord, InventoryCategory, InventoryItem } from '../types';

export const mockProperties: Property[] = [
  { id: '1', name: 'Casa Grande Puerta Real', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Puerta Real, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 450, commissionRate: 15, maintenanceFee: 200, pricePerNight: 1200, bedrooms: 3, bathrooms: 2, maxGuests: 6, sqft: 150, parking: true, pool: false, petFriendly: true, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '2', name: 'Casa Laurel', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Centro, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 350, commissionRate: 15, maintenanceFee: 150, pricePerNight: 800, bedrooms: 2, bathrooms: 1, maxGuests: 4, sqft: 80, parking: false, pool: false, petFriendly: false, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '3', name: 'Avanta Hotel & Villas', role: 'cohost', type: 'hotel', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Juriquilla, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 200, commissionRate: 20, maintenanceFee: 500, pricePerNight: 1500, bedrooms: 1, bathrooms: 1, maxGuests: 4, sqft: 45, parking: true, pool: true, petFriendly: false, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '4', name: 'Casa de la Puerta Azul', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Centro, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 500, commissionRate: 18, maintenanceFee: 300, pricePerNight: 2000, bedrooms: 4, bathrooms: 3, maxGuests: 8, sqft: 200, parking: true, pool: false, petFriendly: true, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '5', name: 'Casa Mora', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Juriquilla, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 400, commissionRate: 15, maintenanceFee: 250, pricePerNight: 1800, bedrooms: 3, bathrooms: 2, maxGuests: 6, sqft: 180, parking: true, pool: true, petFriendly: false, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '6', name: 'Casa Quintas del Marqués', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'El Marqués, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 600, commissionRate: 15, maintenanceFee: 400, pricePerNight: 2500, bedrooms: 5, bathrooms: 4, maxGuests: 10, sqft: 300, parking: true, pool: false, petFriendly: true, airbnbUrl: '', airbnbId: '', status: 'activo' },
  { id: '7', name: 'Departamento con Terraza Kenza', role: 'cohost', type: 'departamento', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1e52504431?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Zibatá, Qro', hostName: '', hostPhone: '', hostEmail: '', cleaningFee: 350, commissionRate: 15, maintenanceFee: 150, pricePerNight: 1100, bedrooms: 2, bathrooms: 2, maxGuests: 4, sqft: 95, parking: true, pool: true, petFriendly: false, airbnbUrl: '', airbnbId: '', status: 'activo' },
];

export const mockUsers: AppUser[] = [];
export const mockPropertyConfigs: PropertyConfig[] = mockProperties.map(prop => ({
  id: `cfg_${prop.id}`,
  propertyId: prop.id,
  ownerName: prop.hostName,
  cohostName: 'Ricardo Peña',
  nightlyRate: prop.pricePerNight,
  airbnbCommission: 0.20,
  cleaningFee: prop.cleaningFee,
  cohostCommission: prop.commissionRate / 100,
  minNights: 2,
  incomeMode: 'BEFORE' as const,
}));

export const mockTasks: Task[] = [];
export const mockIncomes: Income[] = [];
export const mockExpenses: Expense[] = [];
export const mockStays: Stay[] = [];
export const mockExtraExpenses: ExtraExpense[] = [];
export const mockAdminControl: AdminControlRecord[] = [];

export const mockInventoryCategories: InventoryCategory[] = [
  { id: 'cat_1', name: 'Lencería',     icon: '🛏️',  color: '#FF5A5F' },
  { id: 'cat_2', name: 'Cocina',       icon: '🍽️',  color: '#FC642D' },
  { id: 'cat_3', name: 'Limpieza',     icon: '🧹',  color: '#00A699' },
  { id: 'cat_4', name: 'Amenidades',   icon: '🧴',  color: '#7B68EE' },
  { id: 'cat_5', name: 'Herramientas', icon: '🔧',  color: '#FF8C00' },
  { id: 'cat_6', name: 'Electrónica',  icon: '💡',  color: '#FFB400' },
  { id: 'cat_7', name: 'Exterior',     icon: '🌿',  color: '#3CB371' },
  { id: 'cat_8', name: 'Otro',         icon: '📦',  color: '#767676' },
];
export const mockInventoryItems: InventoryItem[] = [];
