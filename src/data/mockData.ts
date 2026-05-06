import type { Property, Task, AppUser, Expense, Income, ExpenseCategory, PropertyConfig, Stay, ExtraExpense, AdminControlRecord } from '../types';

export const mockProperties: Property[] = [
  { id: '1', name: 'Casa Grande Puerta Real', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Puerta Real, Qro', hostName: 'Juan Pérez', hostPhone: '555-1234', hostEmail: 'juan@example.com', cleaningFee: 450, commissionRate: 15, maintenanceFee: 200, pricePerNight: 1200, bedrooms: 3, bathrooms: 2, maxGuests: 6, sqft: 150, parking: true, pool: false, petFriendly: true, airbnbUrl: 'https://airbnb.com/h/casa-grande', airbnbId: '12345678', status: 'activo' },
  { id: '2', name: 'Departamento Laurel', role: 'host', type: 'departamento', imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Centro, Qro', hostName: 'María García', hostPhone: '555-5678', hostEmail: 'maria@example.com', cleaningFee: 350, commissionRate: 15, maintenanceFee: 150, pricePerNight: 800, bedrooms: 2, bathrooms: 1, maxGuests: 4, sqft: 80, parking: false, pool: false, petFriendly: false, airbnbUrl: 'https://airbnb.com/h/laurel', airbnbId: '23456789', status: 'activo' },
  { id: '3', name: 'Loft Sonterra', role: 'cohost', type: 'loft', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1e52504431?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Sonterra, Qro', hostName: 'Carlos López', hostPhone: '555-9012', hostEmail: 'carlos@example.com', cleaningFee: 300, commissionRate: 12, maintenanceFee: 100, pricePerNight: 950, bedrooms: 1, bathrooms: 1, maxGuests: 2, sqft: 60, parking: true, pool: true, petFriendly: false, airbnbUrl: 'https://airbnb.com/h/sonterra', airbnbId: '34567890', status: 'activo' },
  { id: '4', name: 'Avanta Hotel & Villas', role: 'cohost', type: 'hotel', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Juriquilla, Qro', hostName: 'Grupo Avanta', hostPhone: '555-3333', hostEmail: 'contacto@avanta.com', cleaningFee: 200, commissionRate: 20, maintenanceFee: 500, pricePerNight: 1500, bedrooms: 1, bathrooms: 1, maxGuests: 4, sqft: 45, parking: true, pool: true, petFriendly: false, airbnbUrl: 'https://airbnb.com/h/avanta', airbnbId: '45678901', status: 'activo' },
  { id: '5', name: 'Casa de la Puerta Azul', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Centro, Qro', hostName: 'Luis Fernández', hostPhone: '555-4444', hostEmail: 'luis@example.com', cleaningFee: 500, commissionRate: 18, maintenanceFee: 300, pricePerNight: 2000, bedrooms: 4, bathrooms: 3, maxGuests: 8, sqft: 200, parking: true, pool: false, petFriendly: true, airbnbUrl: 'https://airbnb.com/h/puerta-azul', airbnbId: '56789012', status: 'activo' },
  { id: '6', name: 'Casa Mora', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Juriquilla, Qro', hostName: 'Ana Gómez', hostPhone: '555-5555', hostEmail: 'ana@example.com', cleaningFee: 400, commissionRate: 15, maintenanceFee: 250, pricePerNight: 1800, bedrooms: 3, bathrooms: 2, maxGuests: 6, sqft: 180, parking: true, pool: true, petFriendly: false, airbnbUrl: 'https://airbnb.com/h/casa-mora', airbnbId: '67890123', status: 'activo' },
  { id: '7', name: 'Casa Quintas del Bosque', role: 'cohost', type: 'casa', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'El Bosque, Qro', hostName: 'Pedro Martínez', hostPhone: '555-6666', hostEmail: 'pedro@example.com', cleaningFee: 600, commissionRate: 15, maintenanceFee: 400, pricePerNight: 2500, bedrooms: 5, bathrooms: 4, maxGuests: 10, sqft: 300, parking: true, pool: false, petFriendly: true, airbnbUrl: 'https://airbnb.com/h/quintas-bosque', airbnbId: '78901234', status: 'mantenimiento' },
  { id: '8', name: 'Kenza', role: 'cohost', type: 'departamento', imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1e52504431?auto=format&fit=crop&w=800&q=80', gallery: [], location: 'Zibatá, Qro', hostName: 'Laura Torres', hostPhone: '555-7777', hostEmail: 'laura@example.com', cleaningFee: 350, commissionRate: 15, maintenanceFee: 150, pricePerNight: 1100, bedrooms: 2, bathrooms: 2, maxGuests: 4, sqft: 95, parking: true, pool: true, petFriendly: false, airbnbUrl: 'https://airbnb.com/h/kenza', airbnbId: '89012345', status: 'activo' }
];

export const mockUsers: AppUser[] = [
  { id: 'u1', name: 'Admin Principal', email: 'admin@cohost.com', phone: '555-0001', role: 'admin', propertyAccess: [], avatarUrl: 'https://ui-avatars.com/api/?name=Admin+Principal&background=FF5A5F&color=fff', status: 'active', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'u2', name: 'Gerente General', email: 'gerente@cohost.com', phone: '555-0002', role: 'manager', propertyAccess: [], avatarUrl: 'https://ui-avatars.com/api/?name=Gerente+General&background=00A699&color=fff', status: 'active', createdAt: '2026-01-15T00:00:00Z' },
  { id: 'u3', name: 'Juan Pérez (Host)', email: 'juan@example.com', phone: '555-1234', role: 'host', propertyAccess: ['1'], avatarUrl: 'https://ui-avatars.com/api/?name=Juan+Perez&background=222222&color=fff', status: 'active', createdAt: '2026-02-01T00:00:00Z' },
  { id: 'u4', name: 'Equipo Limpieza 1', email: 'limpieza1@cohost.com', phone: '555-0004', role: 'cleaning_staff', propertyAccess: ['1', '2', '3', '4'], avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', status: 'active', createdAt: '2026-02-10T00:00:00Z' },
  { id: 'u5', name: 'Equipo Mantenimiento', email: 'mantenimiento@cohost.com', phone: '555-0005', role: 'maintenance_staff', propertyAccess: [], avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', status: 'active', createdAt: '2026-02-15T00:00:00Z' }
];

// Generar Tasks, Incomes, Expenses programáticamente para 3 meses
const today = new Date();
export const mockTasks: Task[] = [];
export const mockIncomes: Income[] = [];
export const mockExpenses: Expense[] = [];
export const mockPropertyConfigs: PropertyConfig[] = [];
export const mockStays: Stay[] = [];
export const mockExtraExpenses: ExtraExpense[] = [];

const categories: ExpenseCategory[] = ['cleaning', 'maintenance', 'supplies', 'platform_fee', 'utilities', 'other'];

let taskIdCounter = 1;
let incomeIdCounter = 1;
let expenseIdCounter = 1;
let stayIdCounter = 1;

mockProperties.forEach(prop => {
  mockPropertyConfigs.push({
    id: `cfg_${prop.id}`,
    propertyId: prop.id,
    ownerName: prop.hostName,
    cohostName: 'Tezca Admin',
    nightlyRate: prop.pricePerNight,
    airbnbCommission: 0.20,
    cleaningFee: prop.cleaningFee,
    cohostCommission: prop.commissionRate / 100,
    minNights: 2,
    incomeMode: 'BEFORE'
  });
});

for (let i = 0; i < 90; i++) {
  const date = new Date(today);
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split('T')[0];
  
  mockProperties.forEach(prop => {
    // 30% chance de tener un task pendiente si es en los últimos 3 días, si no, completado
    if (Math.random() > 0.7) {
      const isRecent = i < 4;
      mockTasks.push({
        id: `t${taskIdCounter++}`,
        propertyId: prop.id,
        title: `Limpieza ${prop.name}`,
        description: 'Limpieza estándar programada',
        status: isRecent ? (Math.random() > 0.5 ? 'Pendiente' : 'En Progreso') : 'Completado',
        type: 'Limpieza',
        assignedTo: 'Equipo Limpieza 1',
        date: dateStr,
        photos: []
      });
    }

    // Incomes (aleatorio cada ciertos días)
    if (Math.random() > 0.8) {
      const gross = prop.pricePerNight * (Math.floor(Math.random() * 3) + 1);
      const comission = gross * (prop.commissionRate / 100);
      mockIncomes.push({
        id: `i${incomeIdCounter++}`,
        propertyId: prop.id,
        date: dateStr,
        grossIncome: gross,
        cohostCommission: comission,
        ownerNet: gross - comission
      });

      if (Math.random() > 0.5) {
        const nights = Math.floor(Math.random() * 5) + 2;
        const regIncome = prop.pricePerNight * nights;
        const airbnbComm = regIncome * 0.20;
        const afterAirbnb = regIncome - airbnbComm;
        const sub = afterAirbnb - prop.cleaningFee;
        const cohostComm = sub * (prop.commissionRate / 100);
        
        mockStays.push({
          id: `s${stayIdCounter++}`,
          propertyId: prop.id,
          stayNumber: stayIdCounter,
          date: dateStr,
          nights,
          registeredIncome: regIncome,
          incomeMode: 'BEFORE',
          airbnbCommission: airbnbComm,
          afterAirbnb,
          cleaningFee: prop.cleaningFee,
          subtotal: sub,
          cohostCommission: cohostComm,
          extraExpenses: 0,
          netProfit: sub - cohostComm,
        });
      }
    }

    // Expenses
    if (Math.random() > 0.85) {
      mockExpenses.push({
        id: `e${expenseIdCounter++}`,
        propertyId: prop.id,
        category: categories[Math.floor(Math.random() * categories.length)],
        description: 'Gasto operativo',
        amount: Math.floor(Math.random() * 500) + 100,
        date: dateStr,
        createdBy: 'u1',
        createdAt: date.toISOString()
      });
    }
  });
}

const adminRaw: Array<{
  pid: string; pname: string; period: string; month: number; year: number;
  income: number; cleaning: number;
}> = [
  // Marzo 2026
  { pid: '1', pname: 'Casa Grande Puerta Real',  period: 'Marzo 2026', month: 3, year: 2026, income: 14400, cleaning: 1800 },
  { pid: '2', pname: 'Departamento Laurel',       period: 'Marzo 2026', month: 3, year: 2026, income:  8000, cleaning: 1400 },
  { pid: '3', pname: 'Loft Sonterra',             period: 'Marzo 2026', month: 3, year: 2026, income:  9500, cleaning: 1200 },
  { pid: '4', pname: 'Avanta Hotel & Villas',     period: 'Marzo 2026', month: 3, year: 2026, income: 18000, cleaning: 1000 },
  { pid: '5', pname: 'Casa de la Puerta Azul',    period: 'Marzo 2026', month: 3, year: 2026, income: 18000, cleaning: 1500 },
  { pid: '6', pname: 'Casa Mora',                 period: 'Marzo 2026', month: 3, year: 2026, income: 16200, cleaning: 1200 },
  { pid: '7', pname: 'Casa Quintas del Bosque',   period: 'Marzo 2026', month: 3, year: 2026, income: 20000, cleaning: 1200 },
  { pid: '8', pname: 'Kenza',                     period: 'Marzo 2026', month: 3, year: 2026, income: 11000, cleaning: 1400 },
  // Abril 2026
  { pid: '1', pname: 'Casa Grande Puerta Real',  period: 'Abril 2026', month: 4, year: 2026, income: 16800, cleaning: 2250 },
  { pid: '2', pname: 'Departamento Laurel',       period: 'Abril 2026', month: 4, year: 2026, income:  9600, cleaning: 1750 },
  { pid: '3', pname: 'Loft Sonterra',             period: 'Abril 2026', month: 4, year: 2026, income: 11400, cleaning: 1500 },
  { pid: '4', pname: 'Avanta Hotel & Villas',     period: 'Abril 2026', month: 4, year: 2026, income: 22500, cleaning: 1200 },
  { pid: '5', pname: 'Casa de la Puerta Azul',    period: 'Abril 2026', month: 4, year: 2026, income: 24000, cleaning: 2000 },
  { pid: '6', pname: 'Casa Mora',                 period: 'Abril 2026', month: 4, year: 2026, income: 21600, cleaning: 1600 },
  { pid: '7', pname: 'Casa Quintas del Bosque',   period: 'Abril 2026', month: 4, year: 2026, income: 25000, cleaning: 1800 },
  { pid: '8', pname: 'Kenza',                     period: 'Abril 2026', month: 4, year: 2026, income: 13200, cleaning: 1750 },
  // Mayo 2026
  { pid: '1', pname: 'Casa Grande Puerta Real',  period: 'Mayo 2026', month: 5, year: 2026, income: 19200, cleaning: 2700 },
  { pid: '2', pname: 'Departamento Laurel',       period: 'Mayo 2026', month: 5, year: 2026, income: 11200, cleaning: 2100 },
  { pid: '3', pname: 'Loft Sonterra',             period: 'Mayo 2026', month: 5, year: 2026, income: 13300, cleaning: 1800 },
  { pid: '4', pname: 'Avanta Hotel & Villas',     period: 'Mayo 2026', month: 5, year: 2026, income: 27000, cleaning: 1400 },
  { pid: '5', pname: 'Casa de la Puerta Azul',    period: 'Mayo 2026', month: 5, year: 2026, income: 28000, cleaning: 2500 },
  { pid: '6', pname: 'Casa Mora',                 period: 'Mayo 2026', month: 5, year: 2026, income: 25200, cleaning: 2000 },
  { pid: '7', pname: 'Casa Quintas del Bosque',   period: 'Mayo 2026', month: 5, year: 2026, income: 30000, cleaning: 2400 },
  { pid: '8', pname: 'Kenza',                     period: 'Mayo 2026', month: 5, year: 2026, income: 16500, cleaning: 2100 },
];

export const mockAdminControl: AdminControlRecord[] = adminRaw.map((r, i) => {
  const airbnb_commission = Math.round(r.income * 0.13);
  const total_cost = r.cleaning + airbnb_commission;
  const profit = r.income - total_cost;
  const margin_percent = Math.round((profit / r.income) * 1000) / 10;
  return {
    id: `ac${i + 1}`,
    property_id: r.pid,
    property_name: r.pname,
    period: r.period,
    month: r.month,
    year: r.year,
    airbnb_income: r.income,
    cleaning_cost: r.cleaning,
    airbnb_commission,
    total_cost,
    profit,
    margin_percent,
  };
});
