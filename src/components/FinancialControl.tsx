import { useState, useMemo, useEffect } from 'react';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from './PaginationBar';
import { Download, FileText, Plus, Save, Pencil, Trash2, CheckSquare, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';
import type { Stay, PropertyConfig, ExpenseCategory } from '../types';
import { downloadExcel, downloadPDF } from '../utils/downloadReport';

type StayForm = {
  checkIn: string;
  checkOut: string;
  guestName: string;
  nights: string;
  guestTotal: string;   // El huésped pagó (total)
  hostTotal: string;    // Tú ganas (total, de Airbnb) — solo en modo MANUAL
  calcMode: 'TRADITIONAL' | 'MANUAL' | 'PFISICA' | 'SINDATOSFISCALES' | 'FUERASINFCTR' | 'FUERACONFCTR';
  incomeMode: 'BEFORE' | 'AFTER';
  extraExpenses: string;
  notes: string;
};

const DEFAULT_STAY_FORM: StayForm = {
  checkIn: '', checkOut: '', guestName: '', nights: '1',
  guestTotal: '', hostTotal: '',
  calcMode: 'TRADITIONAL',
  incomeMode: 'BEFORE', extraExpenses: '', notes: '',
};

// ── Modo MANUAL — tasas para back-calc desde hostTotal ────────────────────────
const AB_HOST_FEE    = 0.03;   // 3%  comisión anfitrión
const AB_IVA         = 0.16;   // 16% IVA México
const AB_IVA_RET     = 0.08;   // 8%  IVA retenido por Airbnb
const AB_ISR_RET     = 0.04;   // 4%  ISR retenido por Airbnb
const AB_ISH         = 0.035;  // 3.5% ISH Querétaro

// ── AIRBNB Tradicional — tasas del ejemplo real ───────────────────────────────
const TRAD_OCC  = 0.195;  // 19.5% impuestos ocupación (IVA + ISH combinados)
const TRAD_CA   = 0.155;  // 15.5% comisión Airbnb al anfitrión
const TRAD_IVA  = 0.16;   // 16%   IVA (se aplica sobre la comisión)
const TRAD_IVAR = 0.08;   // 8%    IVA retenido por Airbnb
const TRAD_ISR  = 0.025;  // 2.5%  ISR retenido por Airbnb

// ── P.FÍSICA — igual que Tradicional pero ISR = 4% (Persona Física) ──────────
const PF_OCC  = 0.195;
const PF_CA   = 0.155;
const PF_IVA  = 0.16;
const PF_IVAR = 0.08;
const PF_ISR  = 0.04;   // 4% ISR — diferencia clave vs. P.MORAL

// ── SIN DATOS FISCALES — IVA ret. 16% e ISR ret. 20% (tasa máxima) ──────────
const SDF_OCC  = 0.195;
const SDF_CA   = 0.155;
const SDF_IVA  = 0.16;
const SDF_IVAR = 0.16;  // 16% IVA retenido (mayor que P.FÍSICA/MORAL)
const SDF_ISR  = 0.20;  // 20% ISR retenido (tasa máxima sin datos fiscales)

// ── FUERA DE AIRBNB SIN FACTURA — sin impuestos ni comisiones ────────────────
// Guest pays exactly what you charge; no platform fees, no taxes

// ── FUERA DE AIRBNB CON FACTURA — ISH 10% + IVA 16% a SAT ───────────────────
const FCFC_ISH  = 0.10;                           // ISH 10% sobre renta
const FCFC_IVA  = 0.16;                           // IVA 16% sobre (renta + ISH)
const FCFC_MULT = (1 + FCFC_ISH) * (1 + FCFC_IVA); // 1.10 × 1.16 = 1.276

// ── Date helpers ──────────────────────────────────────────────────────────────
const addDays = (dateStr: string, days: number): string => {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};
const daysBetween = (from: string, to: string): number => {
  const a = new Date(from + 'T12:00:00');
  const b = new Date(to + 'T12:00:00');
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 3600 * 24)));
};

type ConfigForm = {
  ownerName: string;
  cohostName: string;
  nightlyRate: string;
  cleaningFee: string;
  airbnbCommission: string;
  cohostCommission: string;
  incomeMode: 'BEFORE' | 'AFTER';
  minNights: string;
};

export default function FinancialControl({ propertyId }: { propertyId: string }) {
  const { expenses: contextExpenses, properties, users, stays: allStays, addStay, updateStay, deleteStay, addExpense, deleteExpense, propertyConfigs, upsertPropertyConfig } = useApp();

  // ── Tabs & period ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'config' | 'stays' | 'report' | 'expenses'>('stays');
  const [period, setPeriod]       = useState('month');
  const [dateFrom, setDateFrom]   = useState('');
  const [dateTo, setDateTo]       = useState('');

  // ── Core data ─────────────────────────────────────────────────────────────
  const contextConfig = propertyConfigs.find(c => c.propertyId === propertyId);
  const property = properties.find(p => p.id === propertyId);

  const config: PropertyConfig = contextConfig ?? {
    id: `cfg_${propertyId}`,
    propertyId,
    ownerName: property?.hostName ?? '',
    cohostName: 'Ricardo Peña',
    nightlyRate: property?.pricePerNight ?? 0,
    airbnbCommission: 0.20,
    cleaningFee: property?.cleaningFee ?? 0,
    cohostCommission: (property?.commissionRate ?? 15) / 100,
    minNights: 2,
    incomeMode: 'BEFORE',
  };

  const stays = allStays.filter(s => s.propertyId === propertyId);

  // ── Tab A: config form (controlled) ──────────────────────────────────────
  const [configForm, setConfigForm] = useState<ConfigForm>({
    ownerName:         config.ownerName,
    cohostName:        config.cohostName,
    nightlyRate:       String(config.nightlyRate),
    cleaningFee:       String(config.cleaningFee),
    airbnbCommission:  String(config.airbnbCommission * 100),
    cohostCommission:  String(config.cohostCommission * 100),
    incomeMode:        config.incomeMode,
    minNights:         String(config.minNights),
  });

  // Sync form when switching properties
  useEffect(() => {
    const c = propertyConfigs.find(x => x.propertyId === propertyId) ?? config;
    setConfigForm({
      ownerName:        c.ownerName,
      cohostName:       c.cohostName,
      nightlyRate:      String(c.nightlyRate),
      cleaningFee:      String(c.cleaningFee),
      airbnbCommission: String(c.airbnbCommission * 100),
      cohostCommission: String(c.cohostCommission * 100),
      incomeMode:       c.incomeMode,
      minNights:        String(c.minNights),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId]);

  // ── Tab B: stay modal ─────────────────────────────────────────────────────
  const [stayModalOpen, setStayModalOpen] = useState(false);
  const [editingStay, setEditingStay]     = useState<Stay | null>(null);
  const [stayForm, setStayForm]           = useState<StayForm>(DEFAULT_STAY_FORM);
  const [stayErrors, setStayErrors]       = useState<Record<string, string>>({});
  const [incomeTab, setIncomeTab]         = useState<'host' | 'guest'>('host');

  // ── Tab B: multi-select ───────────────────────────────────────────────────
  const [selectMode, setSelectMode]       = useState(false);
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());

  // ── Tab D: expense modal ──────────────────────────────────────────────────
  const todayStr = () => new Date().toISOString().split('T')[0];
  const [expModalOpen, setExpModalOpen]   = useState(false);
  const [expForm, setExpForm]             = useState({ date: todayStr(), description: '', category: 'other' as ExpenseCategory, amount: '' });
  const [expErrors, setExpErrors]         = useState<Record<string, string>>({});

  // ── Tab D: multi-select ───────────────────────────────────────────────────
  const [expSelectMode, setExpSelectMode]       = useState(false);
  const [selectedExps, setSelectedExps]         = useState<Set<string>>(new Set());

  // ── Date filter ───────────────────────────────────────────────────────────
  const now = new Date();
  const filterByDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'week')  { const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24); return diff >= 0 && diff <= 7; }
    if (period === 'today') return d.toDateString() === now.toDateString();
    if (period === 'range') {
      if (dateFrom) { const from = new Date(dateFrom); if (d < from) return false; }
      if (dateTo)   { const to = new Date(dateTo); to.setHours(23, 59, 59, 999); if (d > to) return false; }
      return true;
    }
    return true;
  };

  const filteredStays    = stays.filter(s => filterByDate(s.date));
  const filteredExpenses = contextExpenses.filter(e => e.propertyId === propertyId && filterByDate(e.date));

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    upsertPropertyConfig({
      ...config,
      ownerName:        configForm.ownerName,
      cohostName:       configForm.cohostName,
      nightlyRate:      parseFloat(configForm.nightlyRate) || 0,
      cleaningFee:      parseFloat(configForm.cleaningFee) || 0,
      airbnbCommission: (parseFloat(configForm.airbnbCommission) || 0) / 100,
      cohostCommission: (parseFloat(configForm.cohostCommission) || 0) / 100,
      incomeMode:       configForm.incomeMode,
      minNights:        parseInt(configForm.minNights) || 1,
    });
    toast.success('Configuración guardada correctamente');
  };

  const stayPagFC = usePagination(filteredStays, 'fc_stays');
  const expPagFC  = usePagination(filteredExpenses, 'fc_expenses');

  const reportSummary = useMemo(() => filteredStays.reduce((acc, stay) => {
    acc.totalNights       += stay.nights;
    acc.registeredIncome  += stay.registeredIncome;
    acc.airbnbCommission  += stay.airbnbCommission;
    acc.afterAirbnb       += stay.afterAirbnb;
    acc.cleaning          += stay.cleaningFee;
    acc.subtotal          += stay.subtotal;
    acc.cohostCommission  += stay.cohostCommission;
    acc.extraExpenses     += stay.extraExpenses;
    acc.netProfit         += stay.netProfit;
    acc.totalGuestPaid    += stay.guestTotal ?? 0;
    acc.totalHostEarned   += stay.hostTotal ?? 0;
    return acc;
  }, { totalNights: 0, registeredIncome: 0, airbnbCommission: 0, afterAirbnb: 0, cleaning: 0, subtotal: 0, cohostCommission: 0, extraExpenses: 0, netProfit: 0, totalGuestPaid: 0, totalHostEarned: 0 }), [filteredStays]);

  // ── Stay calculator ───────────────────────────────────────────────────────
  const calcStay = (form: StayForm, id: string, stayNumber: number): Stay => {
    const nights  = parseInt(form.nights) || 1;
    const extras  = parseFloat(form.extraExpenses) || 0;
    const gt      = parseFloat(form.guestTotal) || 0;
    const cleaning = config.cleaningFee;

    // ── Modo AIRBNB TRADICIONAL ──────────────────────────────────────────────
    if (form.calcMode === 'TRADITIONAL') {
      // Paso 1: retroacalcular costo de renta desde el total del huésped
      //   gt = roomTariff * (1 + TRAD_OCC)
      //   roomTariff = gt / (1 + TRAD_OCC)
      const roomTariff        = gt / (1 + TRAD_OCC);
      const nightlyRate       = roomTariff / nights;
      // Lo que pagó el huésped
      const occupationTax     = roomTariff * TRAD_OCC;
      const guestServiceFee   = 0; // normalmente $0 en México
      // Lo que tú ganas
      const hostServiceFee    = roomTariff * TRAD_CA * (1 + TRAD_IVA); // comisión Airbnb
      const lodgingTaxLiq     = roomTariff * TRAD_IVA;                  // IVA liquidado
      const ivaRetained       = roomTariff * TRAD_IVAR;                  // IVA retenido
      const isrRetained       = roomTariff * TRAD_ISR;                   // ISR retenido
      const hostTotal         = roomTariff + lodgingTaxLiq - hostServiceFee - ivaRetained - isrRetained;
      // Tabla financiera
      const airbnbComm        = gt - hostTotal;
      const afterAirbnb       = hostTotal;
      const subtotal          = afterAirbnb - cleaning;
      const cohostComm        = subtotal * config.cohostCommission;

      return {
        id, propertyId, stayNumber,
        date:     form.checkIn,
        checkOut: form.checkOut || undefined,
        guestName: form.guestName.trim() || undefined,
        nights, nightlyRate,
        guestTotal:           gt,
        guestRoomTariff:      roomTariff,
        guestServiceFee,
        guestOccupationTax:   occupationTax,
        hostTotal,
        hostServiceFeeAmount: hostServiceFee,
        lodgingTaxLiquidated: lodgingTaxLiq,
        ivaRetained,
        isrRetained,
        registeredIncome: gt,
        incomeMode:       'BEFORE' as const,
        airbnbCommission: airbnbComm,
        afterAirbnb,
        cleaningFee:      cleaning,
        subtotal,
        cohostCommission: cohostComm,
        extraExpenses:    extras,
        netProfit:        subtotal - cohostComm - extras,
        notes:            form.notes.trim() || undefined,
        calcMode:         'TRADITIONAL',
      };
    }

    // ── Modo P.FÍSICA ────────────────────────────────────────────────────────
    if (form.calcMode === 'PFISICA') {
      const roomTariff      = gt / (1 + PF_OCC);
      const nightlyRate     = roomTariff / nights;
      const occupationTax   = roomTariff * PF_OCC;
      const hostServiceFee  = roomTariff * PF_CA * (1 + PF_IVA);
      const lodgingTaxLiq   = roomTariff * PF_IVA;
      const ivaRetained     = roomTariff * PF_IVAR;
      const isrRetained     = roomTariff * PF_ISR;
      const hostTotal       = roomTariff + lodgingTaxLiq - hostServiceFee - ivaRetained - isrRetained;
      const airbnbComm      = gt - hostTotal;
      const afterAirbnb     = hostTotal;
      const subtotal        = afterAirbnb - cleaning;
      const cohostComm      = subtotal * config.cohostCommission;

      return {
        id, propertyId, stayNumber,
        date:     form.checkIn,
        checkOut: form.checkOut || undefined,
        guestName: form.guestName.trim() || undefined,
        nights, nightlyRate,
        guestTotal:           gt,
        guestRoomTariff:      roomTariff,
        guestServiceFee:      0,
        guestOccupationTax:   occupationTax,
        hostTotal,
        hostServiceFeeAmount: hostServiceFee,
        lodgingTaxLiquidated: lodgingTaxLiq,
        ivaRetained,
        isrRetained,
        registeredIncome: gt,
        incomeMode:       'BEFORE' as const,
        airbnbCommission: airbnbComm,
        afterAirbnb,
        cleaningFee:      cleaning,
        subtotal,
        cohostCommission: cohostComm,
        extraExpenses:    extras,
        netProfit:        subtotal - cohostComm - extras,
        notes:            form.notes.trim() || undefined,
        calcMode:         'PFISICA',
      };
    }

    // ── Modo FUERA DE AIRBNB SIN FACTURA ────────────────────────────────────
    if (form.calcMode === 'FUERASINFCTR') {
      const roomTariff  = gt;          // guest pays exactly what you charge
      const nightlyRate = roomTariff / nights;
      const afterAirbnb = roomTariff;
      const subtotal    = afterAirbnb - cleaning;
      const cohostComm  = subtotal * config.cohostCommission;

      return {
        id, propertyId, stayNumber,
        date:     form.checkIn,
        checkOut: form.checkOut || undefined,
        guestName: form.guestName.trim() || undefined,
        nights, nightlyRate,
        guestTotal:           gt,
        guestRoomTariff:      roomTariff,
        guestServiceFee:      0,
        guestOccupationTax:   0,
        hostTotal:            roomTariff,
        hostServiceFeeAmount: 0,
        lodgingTaxLiquidated: 0,
        ivaRetained:          0,
        isrRetained:          0,
        registeredIncome: gt,
        incomeMode:       'BEFORE' as const,
        airbnbCommission: 0,
        afterAirbnb,
        cleaningFee:      cleaning,
        subtotal,
        cohostCommission: cohostComm,
        extraExpenses:    extras,
        netProfit:        subtotal - cohostComm - extras,
        notes:            form.notes.trim() || undefined,
        calcMode:         'FUERASINFCTR',
      };
    }

    // ── Modo FUERA DE AIRBNB CON FACTURA ────────────────────────────────────
    if (form.calcMode === 'FUERACONFCTR') {
      const roomTariff  = gt / FCFC_MULT;                        // base rent
      const nightlyRate = roomTariff / nights;
      const ish         = roomTariff * FCFC_ISH;                 // ISH 10%
      const iva         = roomTariff * (1 + FCFC_ISH) * FCFC_IVA; // IVA 16%
      // IVA collected = IVA remitted to SAT → net IVA impact on host = 0
      // hostTotal = roomTariff + iva - 0 - iva - 0 = roomTariff
      const hostTotal   = roomTariff;
      const afterAirbnb = roomTariff;
      const subtotal    = afterAirbnb - cleaning;
      const cohostComm  = subtotal * config.cohostCommission;

      return {
        id, propertyId, stayNumber,
        date:     form.checkIn,
        checkOut: form.checkOut || undefined,
        guestName: form.guestName.trim() || undefined,
        nights, nightlyRate,
        guestTotal:           gt,
        guestRoomTariff:      roomTariff,
        guestServiceFee:      0,
        guestOccupationTax:   ish,
        hostTotal,
        hostServiceFeeAmount: 0,
        lodgingTaxLiquidated: iva,  // IVA collected from guest
        ivaRetained:          iva,  // IVA remitted to SAT (cancels lodgingTax)
        isrRetained:          0,
        registeredIncome: gt,
        incomeMode:       'BEFORE' as const,
        airbnbCommission: gt - hostTotal,   // ISH + IVA = taxes to SAT
        afterAirbnb,
        cleaningFee:      cleaning,
        subtotal,
        cohostCommission: cohostComm,
        extraExpenses:    extras,
        netProfit:        subtotal - cohostComm - extras,
        notes:            form.notes.trim() || undefined,
        calcMode:         'FUERACONFCTR',
      };
    }

    // ── Modo SIN DATOS FISCALES ──────────────────────────────────────────────
    if (form.calcMode === 'SINDATOSFISCALES') {
      const roomTariff      = gt / (1 + SDF_OCC);
      const nightlyRate     = roomTariff / nights;
      const occupationTax   = roomTariff * SDF_OCC;
      const hostServiceFee  = roomTariff * SDF_CA * (1 + SDF_IVA);
      const lodgingTaxLiq   = roomTariff * SDF_IVA;
      const ivaRetained     = roomTariff * SDF_IVAR;
      const isrRetained     = roomTariff * SDF_ISR;
      const hostTotal       = roomTariff + lodgingTaxLiq - hostServiceFee - ivaRetained - isrRetained;
      const airbnbComm      = gt - hostTotal;
      const afterAirbnb     = hostTotal;
      const subtotal        = afterAirbnb - cleaning;
      const cohostComm      = subtotal * config.cohostCommission;

      return {
        id, propertyId, stayNumber,
        date:     form.checkIn,
        checkOut: form.checkOut || undefined,
        guestName: form.guestName.trim() || undefined,
        nights, nightlyRate,
        guestTotal:           gt,
        guestRoomTariff:      roomTariff,
        guestServiceFee:      0,
        guestOccupationTax:   occupationTax,
        hostTotal,
        hostServiceFeeAmount: hostServiceFee,
        lodgingTaxLiquidated: lodgingTaxLiq,
        ivaRetained,
        isrRetained,
        registeredIncome: gt,
        incomeMode:       'BEFORE' as const,
        airbnbCommission: airbnbComm,
        afterAirbnb,
        cleaningFee:      cleaning,
        subtotal,
        cohostCommission: cohostComm,
        extraExpenses:    extras,
        netProfit:        subtotal - cohostComm - extras,
        notes:            form.notes.trim() || undefined,
        calcMode:         'SINDATOSFISCALES',
      };
    }

    // ── Modo MANUAL (comportamiento existente) ───────────────────────────────
    const hostTotalInput = parseFloat(form.hostTotal) || 0;
    const AB_NET         = 1 - AB_HOST_FEE * (1 + AB_IVA) + AB_IVA - AB_IVA_RET - AB_ISR_RET;
    const roomTariff     = hostTotalInput > 0 ? hostTotalInput / AB_NET : 0;
    const nightlyRate    = nights > 0 ? roomTariff / nights : 0;
    const hostServiceFee  = roomTariff * AB_HOST_FEE * (1 + AB_IVA);
    const lodgingTaxLiq   = roomTariff * AB_IVA;
    const ivaRetained     = roomTariff * AB_IVA_RET;
    const isrRetained     = roomTariff * AB_ISR_RET;
    const hostTotalCalc   = roomTariff - hostServiceFee + lodgingTaxLiq - ivaRetained - isrRetained;
    const occupationTax   = roomTariff * (AB_IVA + AB_ISH);
    const guestServiceFee = Math.max(0, gt - roomTariff - occupationTax);
    const income          = gt > 0 ? gt : 0;
    const airbnbComm      = gt > 0 && hostTotalInput > 0
      ? gt - hostTotalInput
      : income * config.airbnbCommission;
    const afterAirbnb     = income - airbnbComm;
    const subtotal        = afterAirbnb - cleaning;
    const cohostComm      = subtotal * config.cohostCommission;

    return {
      id, propertyId, stayNumber,
      date:     form.checkIn,
      checkOut: form.checkOut || undefined,
      guestName: form.guestName.trim() || undefined,
      nights,
      nightlyRate:      nightlyRate > 0 ? nightlyRate : undefined,
      guestTotal:           gt > 0 ? gt : undefined,
      guestRoomTariff:      roomTariff > 0 ? roomTariff : undefined,
      guestServiceFee:      roomTariff > 0 ? guestServiceFee : undefined,
      guestOccupationTax:   roomTariff > 0 ? occupationTax : undefined,
      hostTotal:            roomTariff > 0 ? hostTotalCalc : undefined,
      hostServiceFeeAmount: roomTariff > 0 ? hostServiceFee : undefined,
      lodgingTaxLiquidated: roomTariff > 0 ? lodgingTaxLiq : undefined,
      ivaRetained:          roomTariff > 0 ? ivaRetained : undefined,
      isrRetained:          roomTariff > 0 ? isrRetained : undefined,
      registeredIncome: income,
      incomeMode:       'BEFORE' as const,
      airbnbCommission: airbnbComm,
      afterAirbnb,
      cleaningFee:      cleaning,
      subtotal,
      cohostCommission: cohostComm,
      extraExpenses:    extras,
      netProfit:        subtotal - cohostComm - extras,
      notes:            form.notes.trim() || undefined,
      calcMode:         'MANUAL',
    };
  };

  // ── Date / nights bidirectional handlers ─────────────────────────────────
  const handleCheckInChange = (val: string) => {
    setStayForm(f => {
      const nights = parseInt(f.nights) || 1;
      const checkOut = val ? addDays(val, nights) : '';
      return { ...f, checkIn: val, checkOut };
    });
  };

  const handleCheckOutChange = (val: string) => {
    setStayForm(f => {
      const nights = f.checkIn && val ? daysBetween(f.checkIn, val) : parseInt(f.nights) || 1;
      return { ...f, checkOut: val, nights: String(Math.max(1, nights)) };
    });
  };

  const handleNightsChange = (val: string) => {
    setStayForm(f => {
      const n = parseInt(val);
      const checkOut = f.checkIn && n > 0 ? addDays(f.checkIn, n) : f.checkOut;
      return { ...f, nights: val, checkOut };
    });
  };

  // ── Stay modal handlers ───────────────────────────────────────────────────
  const openAddStay = () => {
    setStayForm({
      ...DEFAULT_STAY_FORM,
      incomeMode: config.incomeMode,
    });
    setStayErrors({});
    setEditingStay(null);
    setIncomeTab('host');
    setStayModalOpen(true);
  };

  const openEditStay = (stay: Stay) => {
    const checkIn  = stay.date;
    const checkOut = stay.checkOut ?? (checkIn ? addDays(checkIn, stay.nights) : '');
    const mode = stay.calcMode ?? 'MANUAL';
    setStayForm({
      checkIn,
      checkOut,
      guestName:     stay.guestName ?? '',
      nights:        String(stay.nights),
      guestTotal:    stay.guestTotal ? String(stay.guestTotal) : String(stay.registeredIncome || ''),
      hostTotal:     mode === 'MANUAL' && stay.hostTotal ? String(stay.hostTotal) : '',
      calcMode:      mode as StayForm['calcMode'],
      incomeMode:    stay.incomeMode,
      extraExpenses: stay.extraExpenses > 0 ? String(stay.extraExpenses) : '',
      notes:         stay.notes ?? '',
    });
    setStayErrors({});
    setEditingStay(stay);
    setIncomeTab('host');
    setStayModalOpen(true);
  };

  const closeStayModal = () => {
    setStayModalOpen(false);
    setEditingStay(null);
    setStayForm(DEFAULT_STAY_FORM);
    setStayErrors({});
  };

  const validateStay = (): boolean => {
    const errs: Record<string, string> = {};
    if (!stayForm.checkIn)                                              errs.checkIn    = 'Requerido';
    if (!stayForm.nights || parseInt(stayForm.nights) < 1)              errs.nights     = 'Mínimo 1';
    if (!stayForm.guestTotal || parseFloat(stayForm.guestTotal) <= 0)   errs.guestTotal = 'Ingresa el total del huésped';
    if (stayForm.calcMode === 'MANUAL' &&
        (!stayForm.hostTotal || parseFloat(stayForm.hostTotal) <= 0))   errs.hostTotal  = 'Ingresa lo que tú ganas';
    setStayErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveStay = () => {
    if (!validateStay()) return;
    if (editingStay) {
      updateStay(calcStay(stayForm, editingStay.id, editingStay.stayNumber));
    } else {
      const nextNum = stays.length > 0 ? Math.max(...stays.map(s => s.stayNumber)) + 1 : 1;
      addStay(calcStay(stayForm, `stay_${Date.now()}`, nextNum));
    }
    closeStayModal();
  };

  // ── Multi-select handlers ─────────────────────────────────────────────────
  const toggleSelectStay = (id: string) => {
    setSelectedStays(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedStays(new Set()); };

  const handleDeleteSelected = () => {
    if (!window.confirm(`¿Eliminar ${selectedStays.size} estancia${selectedStays.size !== 1 ? 's' : ''} seleccionada${selectedStays.size !== 1 ? 's' : ''}?`)) return;
    selectedStays.forEach(id => deleteStay(id));
    exitSelectMode();
  };

  // ── Tab D: expense handlers ───────────────────────────────────────────────
  const openExpModal  = () => { setExpForm({ date: todayStr(), description: '', category: 'other', amount: '' }); setExpErrors({}); setExpModalOpen(true); };
  const closeExpModal = () => { setExpModalOpen(false); setExpErrors({}); };

  const handleSaveExpense = () => {
    const errs: Record<string, string> = {};
    if (!expForm.description.trim()) errs.description = 'Requerido';
    if (!expForm.amount || parseFloat(expForm.amount) <= 0) errs.amount = 'Monto inválido';
    if (Object.keys(errs).length) { setExpErrors(errs); return; }
    addExpense({
      id: `exp_${Date.now()}`,
      propertyId,
      category: expForm.category,
      description: expForm.description.trim(),
      amount: parseFloat(expForm.amount),
      date: expForm.date,
      createdBy: 'u1',
      createdAt: new Date().toISOString(),
    });
    toast.success('Gasto registrado correctamente');
    closeExpModal();
  };

  const toggleExpSelect = (id: string) => {
    setSelectedExps(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const exitExpSelectMode = () => { setExpSelectMode(false); setSelectedExps(new Set()); };
  const handleDeleteExpSelected = () => {
    if (!window.confirm(`¿Eliminar ${selectedExps.size} gasto${selectedExps.size !== 1 ? 's' : ''} seleccionado${selectedExps.size !== 1 ? 's' : ''}?`)) return;
    selectedExps.forEach(id => deleteExpense(id));
    exitExpSelectMode();
  };

  // ── Modal form styles ─────────────────────────────────────────────────────
  const minp = (err?: boolean): React.CSSProperties => ({
    width: '100%', padding: '10px 14px', fontFamily: 'inherit', fontSize: '14px',
    border: `1.5px solid ${err ? '#EF4444' : 'var(--border-color)'}`,
    borderRadius: '10px', outline: 'none', background: 'white', boxSizing: 'border-box',
  });
  const mlbl: React.CSSProperties = { display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' };
  const mfld: React.CSSProperties = { marginBottom: '16px' };

  // ── Tab button style ──────────────────────────────────────────────────────
  const tabBtn = (tab: string): React.CSSProperties => ({
    background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, cursor: 'pointer',
    whiteSpace: 'nowrap',
    color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
    borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
  });

  // ── Icon btn style ────────────────────────────────────────────────────────
  const iconBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
    borderRadius: '5px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)',
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Control Financiero</h3>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {(['month', 'week', 'today', 'custom', 'range'] as const).map((p, i) => (
              <button
                key={p}
                className="btn-outline"
                onClick={() => { setPeriod(p); stayPagFC.resetPage(); expPagFC.resetPage(); }}
                style={{ padding: '6px 12px', fontSize: '12px', background: period === p ? 'var(--primary)' : '', color: period === p ? 'white' : '' }}
              >
                {['Este mes', 'Semana actual', 'Hoy', 'Todo Histórico', 'Rango personalizado'][i]}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date range inputs */}
        {period === 'range' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
            background: 'rgba(0, 112, 243, 0.05)', border: '1.5px solid rgba(0, 112, 243, 0.18)',
            borderRadius: '10px', padding: '12px 16px',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
              Rango:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Desde</label>
              <input
                type="date"
                value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); stayPagFC.resetPage(); expPagFC.resetPage(); }}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Hasta</label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={e => { setDateTo(e.target.value); stayPagFC.resetPage(); expPagFC.resetPage(); }}
                style={{ padding: '6px 10px', borderRadius: '8px', border: '1.5px solid var(--border-color)', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                × Limpiar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('config')}   style={tabBtn('config')}>A. Configuración</button>
        <button onClick={() => setActiveTab('stays')}    style={tabBtn('stays')}>B. Registro de Estancias</button>
        <button onClick={() => setActiveTab('report')}   style={tabBtn('report')}>C. Reporte del Período</button>
        <button onClick={() => setActiveTab('expenses')} style={tabBtn('expenses')}>D. Gastos Extras</button>
      </div>

      <div className="property-card" style={{ padding: '24px', overflowX: 'auto' }}>

        {/* ── Tab A: Configuración ─────────────────────────────────────── */}
        {activeTab === 'config' && (
          <form onSubmit={handleConfigSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

              {/* Owner — dropdown from registered users */}
              <div className="form-group">
                <label className="form-label">Propietario</label>
                <select
                  className="form-input"
                  value={configForm.ownerName}
                  onChange={e => setConfigForm(f => ({ ...f, ownerName: e.target.value }))}
                >
                  <option value="">— Seleccionar propietario —</option>
                  {users.filter(u => u.status === 'active').map(u => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                  {/* Keep current value if not in user list */}
                  {configForm.ownerName && !users.some(u => u.name === configForm.ownerName) && (
                    <option value={configForm.ownerName}>{configForm.ownerName}</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Co-Anfitrión</label>
                <input type="text" className="form-input"
                  value={configForm.cohostName}
                  onChange={e => setConfigForm(f => ({ ...f, cohostName: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Precio x Noche Base (MXN)</label>
                <input type="number" min={0} className="form-input"
                  value={configForm.nightlyRate}
                  onChange={e => setConfigForm(f => ({ ...f, nightlyRate: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Costo de Limpieza (MXN)</label>
                <input type="number" min={0} className="form-input"
                  value={configForm.cleaningFee}
                  onChange={e => setConfigForm(f => ({ ...f, cleaningFee: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Comisión Airbnb (%)</label>
                <input type="number" min={0} max={100} step="0.01" className="form-input"
                  value={configForm.airbnbCommission}
                  onChange={e => setConfigForm(f => ({ ...f, airbnbCommission: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Comisión Co-host (%)</label>
                <input type="number" min={0} max={100} step="0.01" className="form-input"
                  value={configForm.cohostCommission}
                  onChange={e => setConfigForm(f => ({ ...f, cohostCommission: e.target.value }))} />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Modo de Registro de Ingresos</label>
                <select className="form-input"
                  value={configForm.incomeMode}
                  onChange={e => setConfigForm(f => ({ ...f, incomeMode: e.target.value as 'BEFORE' | 'AFTER' }))}>
                  <option value="BEFORE">ANTES — Ingreso Bruto cobrado al huésped</option>
                  <option value="AFTER">DESPUÉS — Lo que deposita Airbnb</option>
                </select>
                <small style={{ color: 'var(--text-muted)' }}>
                  Si es ANTES, el sistema restará la comisión de Airbnb. Si es DESPUÉS, asume que Airbnb ya descontó su comisión.
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Mínimo de Noches</label>
                <input type="number" min={1} className="form-input"
                  value={configForm.minNights}
                  onChange={e => setConfigForm(f => ({ ...f, minNights: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Save size={18} /> Guardar Configuración
              </button>
            </div>
          </form>
        )}

        {/* ── Tab B: Registro de Estancias ─────────────────────────────── */}
        {activeTab === 'stays' && (
          <div>
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
              {selectMode ? (
                <button className="btn-outline" onClick={exitSelectMode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Cancelar
                </button>
              ) : (
                <button className="btn-outline" onClick={() => setSelectMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} /> Seleccionar
                </button>
              )}
              <button className="btn-primary" style={{ background: 'var(--success)', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={openAddStay}>
                <Plus size={18} /> Agregar Estancia
              </button>
            </div>

            {/* Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '12px', minWidth: '1920px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                  {selectMode && <th style={{ padding: '10px 8px', width: '36px' }} />}
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>Huésped</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left' }}>Llegada</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center' }}>Noches</th>
                  {/* ── Airbnb breakdown columns ── */}
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', borderLeft: '2px solid var(--border-color)' }}>Costo/Noche</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', fontWeight: 700 }}>H. Pagó</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Tarifa Hab.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Svc. Huésp.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Imp. Ocup.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: '#FC642D' }}>Svc. Anfitr.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>Imp. Aloj.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: '#FC642D' }}>IVA Ret.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: '#FC642D' }}>ISR Ret.</th>
                  <th style={{ padding: '10px 8px', whiteSpace: 'nowrap', color: 'var(--success)', fontWeight: 700 }}>Tú Ganas</th>
                  {/* ── Financial calculation columns ── */}
                  <th style={{ padding: '10px 8px', borderLeft: '2px solid var(--border-color)' }}>Ingreso Reg.</th>
                  <th style={{ padding: '10px 8px', color: '#FC642D' }}>Airbnb</th>
                  <th style={{ padding: '10px 8px' }}>Después Airbnb</th>
                  <th style={{ padding: '10px 8px', color: '#FC642D' }}>Limpieza</th>
                  <th style={{ padding: '10px 8px' }}>Subtotal</th>
                  <th style={{ padding: '10px 8px', color: '#FC642D' }}>Com. Coan.</th>
                  <th style={{ padding: '10px 8px', color: '#FC642D' }}>Extras</th>
                  <th style={{ padding: '10px 8px', color: 'var(--success)' }}>Utilidad Neta</th>
                  {!selectMode && <th style={{ padding: '10px 8px', width: '40px' }} />}
                </tr>
              </thead>
              <tbody>
                {stayPagFC.paginated.map(stay => {
                  const isSelected = selectedStays.has(stay.id);
                  return (
                    <tr
                      key={stay.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isSelected ? 'rgba(0, 112, 243, 0.04)' : undefined,
                        cursor: selectMode ? 'pointer' : 'default',
                        outline: isSelected ? '1px solid var(--primary)' : undefined,
                      }}
                      onClick={() => selectMode && toggleSelectStay(stay.id)}
                    >
                      {/* Checkbox cell */}
                      {selectMode && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px', margin: '0 auto',
                            border: isSelected ? 'none' : '2px solid var(--border-color)',
                            background: isSelected ? 'var(--primary)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSelected && (
                              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '12px', textAlign: 'left' }}>{stay.stayNumber}</td>
                      <td style={{ padding: '12px', textAlign: 'left', color: stay.guestName ? 'var(--text-main)' : 'var(--text-muted)', fontStyle: stay.guestName ? 'normal' : 'italic' }}>
                        {stay.guestName || '—'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left' }}>
                        {new Date(stay.date + 'T12:00:00').toLocaleDateString('es-MX')}
                        {stay.checkOut && (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>
                            → {new Date(stay.checkOut + 'T12:00:00').toLocaleDateString('es-MX')}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{stay.nights}</td>
                      {/* ── Airbnb breakdown cells ── */}
                      <td style={{ padding: '10px 8px', borderLeft: '2px solid var(--border-color)' }}>
                        {stay.guestTotal && stay.nights ? '$' + (stay.guestTotal / stay.nights).toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700 }}>
                        {stay.guestTotal ? '$' + stay.guestTotal.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {stay.guestRoomTariff ? '$' + stay.guestRoomTariff.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {stay.guestServiceFee !== undefined ? '$' + stay.guestServiceFee.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {stay.guestOccupationTax ? '$' + stay.guestOccupationTax.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>
                        {stay.hostServiceFeeAmount ? '-$' + stay.hostServiceFeeAmount.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        {stay.lodgingTaxLiquidated ? '$' + stay.lodgingTaxLiquidated.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>
                        {stay.ivaRetained ? '-$' + stay.ivaRetained.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>
                        {stay.isrRetained ? '-$' + stay.isrRetained.toFixed(2) : '—'}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 700, color: 'var(--success)' }}>
                        {stay.hostTotal ? '$' + stay.hostTotal.toFixed(2) : '—'}
                      </td>
                      {/* ── Financial calculation cells ── */}
                      <td style={{ padding: '10px 8px', fontWeight: 600, borderLeft: '2px solid var(--border-color)' }}>${stay.registeredIncome.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${stay.airbnbCommission.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px' }}>${stay.afterAirbnb.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${stay.cleaningFee.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 600 }}>${stay.subtotal.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: '#FC642D', fontWeight: 600 }} title="20% del Subtotal">-${stay.cohostCommission.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${stay.extraExpenses.toFixed(2)}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--success)', fontWeight: 700 }}>${stay.netProfit.toFixed(2)}</td>
                      {/* Edit icon */}
                      {!selectMode && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            style={iconBtnStyle}
                            onClick={e => { e.stopPropagation(); openEditStay(stay); }}
                            title="Editar estancia"
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,112,243,0.08)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* Totals row */}
                <tr style={{ background: 'var(--bg-color)', fontWeight: 700, fontSize: '12px' }}>
                  {selectMode && <td />}
                  <td colSpan={3} style={{ padding: '10px 8px', textAlign: 'left' }}>TOTALES</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{reportSummary.totalNights}</td>
                  {/* Airbnb breakdown totals */}
                  <td style={{ padding: '10px 8px', borderLeft: '2px solid var(--border-color)' }}>
                    {reportSummary.totalNights > 0 && reportSummary.totalGuestPaid > 0
                      ? '$' + (reportSummary.totalGuestPaid / reportSummary.totalNights).toFixed(2)
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 8px' }}>${reportSummary.totalGuestPaid.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px' }} />
                  <td style={{ padding: '10px 8px', color: 'var(--success)' }}>${reportSummary.totalHostEarned.toFixed(2)}</td>
                  {/* Financial calculation totals */}
                  <td style={{ padding: '10px 8px', borderLeft: '2px solid var(--border-color)' }}>${reportSummary.registeredIncome.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${reportSummary.airbnbCommission.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px' }}>${reportSummary.afterAirbnb.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${reportSummary.cleaning.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px' }}>${reportSummary.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${reportSummary.cohostCommission.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: '#FC642D' }}>-${reportSummary.extraExpenses.toFixed(2)}</td>
                  <td style={{ padding: '10px 8px', color: 'var(--success)' }}>${reportSummary.netProfit.toFixed(2)}</td>
                  {!selectMode && <td />}
                </tr>
              </tbody>
            </table>

            <PaginationBar {...stayPagFC} />

            {/* Floating action bar (multi-select) */}
            {selectMode && selectedStays.size > 0 && (
              <div style={{
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--text-main)', color: 'white', borderRadius: '16px',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: 1000,
                fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                <span>{selectedStays.size} seleccionada{selectedStays.size !== 1 ? 's' : ''}</span>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.25)' }} />
                <button
                  onClick={handleDeleteSelected}
                  style={{
                    background: 'rgba(255,90,95,0.22)', color: '#FF8A8E', border: 'none',
                    borderRadius: '8px', padding: '6px 16px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Tab C: Reporte ───────────────────────────────────────────── */}
        {activeTab === 'report' && (
          <div style={{ background: '#fff', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>Reporte Financiero de Propiedad</h2>
              <p style={{ color: 'var(--text-muted)' }}>Período Seleccionado: {filteredStays.length} Estancias Registradas</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Resumen Ejecutivo</h4>
                <div className="detail-row"><div className="detail-label">Total Estancias</div><div className="detail-value">{filteredStays.length}</div></div>
                <div className="detail-row"><div className="detail-label">Total Noches</div><div className="detail-value">{reportSummary.totalNights}</div></div>
                <div className="detail-row"><div className="detail-label">Promedio Noches / Estancia</div><div className="detail-value">{(reportSummary.totalNights / (filteredStays.length || 1)).toFixed(1)}</div></div>
                <div className="detail-row"><div className="detail-label">Promedio Utilidad / Noche</div><div className="detail-value">${(reportSummary.netProfit / (reportSummary.totalNights || 1)).toFixed(2)}</div></div>
              </div>
              <div style={{ background: 'var(--bg-color)', padding: '20px', borderRadius: '12px' }}>
                <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Resumen Financiero</h4>
                <div className="detail-row"><div className="detail-label">Ingreso Registrado</div><div className="detail-value">${reportSummary.registeredIncome.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Comisión Airbnb</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.airbnbCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ fontWeight: 600 }}>Después de Airbnb</div><div className="detail-value" style={{ fontWeight: 600 }}>${reportSummary.afterAirbnb.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Limpieza</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.cleaning.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ fontWeight: 600 }}>Subtotal</div><div className="detail-value" style={{ fontWeight: 600 }}>${reportSummary.subtotal.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FF5A5F' }}>- Com. Co-anfitrión (20% Subtotal)</div><div className="detail-value" style={{ color: '#FF5A5F' }}>-${reportSummary.cohostCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{ color: '#FC642D' }}>- Gastos Extras</div><div className="detail-value" style={{ color: '#FC642D' }}>-${reportSummary.extraExpenses.toFixed(2)}</div></div>
                <div className="detail-row" style={{ borderTop: '2px solid var(--border-color)', marginTop: '8px' }}>
                  <div className="detail-label" style={{ fontWeight: 700 }}>Utilidad Neta</div>
                  <div className="detail-value" style={{ fontWeight: 800, fontSize: '18px', color: 'var(--success)' }}>${reportSummary.netProfit.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
              <h4 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '16px' }}>Distribución del Ingreso</h4>
              <div style={{ height: '30px', width: '100%', display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${(reportSummary.airbnbCommission / reportSummary.registeredIncome) * 100}%`, background: '#FC642D' }} title="Airbnb" />
                <div style={{ width: `${(reportSummary.cleaning / reportSummary.registeredIncome) * 100}%`, background: '#FFB020' }} title="Limpieza" />
                <div style={{ width: `${(reportSummary.cohostCommission / reportSummary.registeredIncome) * 100}%`, background: '#FF5A5F' }} title="Ricardo" />
                <div style={{ width: `${(reportSummary.netProfit / reportSummary.registeredIncome) * 100}%`, background: 'var(--success)' }} title="Utilidad Neta" />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)', justifyContent: 'center' }}>
                {[['#FC642D', 'Airbnb'], ['#FFB020', 'Limpieza'], ['#FF5A5F', 'Co-Anfitrión (20%)'], ['var(--success)', 'Propietario']].map(([color, label]) => (
                  <span key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 10, height: 10, background: color, borderRadius: '50%' }} /> {label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Propietario</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }} />
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Ricardo Peña (Co-Anfitrión)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
              <button
                className="btn-outline"
                onClick={() => {
                  const periodLabel = period === 'month' ? `${now.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`
                    : period === 'week'  ? 'Última semana'
                    : period === 'today' ? new Date().toLocaleDateString('es-MX')
                    : period === 'range' && (dateFrom || dateTo) ? `${dateFrom || '…'} — ${dateTo || '…'}`
                    : 'Historial completo';
                  downloadPDF(
                    filteredStays,
                    reportSummary,
                    property?.name ?? 'Propiedad',
                    periodLabel,
                    config.ownerName || 'Propietario',
                    config.cohostName || 'Co-Anfitrión',
                  );
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Download size={18} /> Descargar PDF
              </button>
              <button
                className="btn-outline"
                onClick={async () => {
                  const periodLabel = period === 'month' ? `${now.toLocaleString('es-MX', { month: 'long', year: 'numeric' })}`
                    : period === 'week'  ? 'Última semana'
                    : period === 'today' ? new Date().toLocaleDateString('es-MX')
                    : period === 'range' && (dateFrom || dateTo) ? `${dateFrom || '…'} — ${dateTo || '…'}`
                    : 'Historial completo';
                  await downloadExcel(
                    filteredStays,
                    reportSummary,
                    property?.name ?? 'Propiedad',
                    periodLabel,
                    config.ownerName || 'Propietario',
                    config.cohostName || 'Co-Anfitrión',
                  );
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <FileText size={18} /> Descargar Excel
              </button>
            </div>
          </div>
        )}

        {/* ── Tab D: Gastos Extras ─────────────────────────────────────── */}
        {activeTab === 'expenses' && (
          <div>
            {/* Top bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
              {expSelectMode ? (
                <button className="btn-outline" onClick={exitExpSelectMode} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <X size={16} /> Cancelar
                </button>
              ) : (
                <button className="btn-outline" onClick={() => setExpSelectMode(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={16} /> Seleccionar
                </button>
              )}
              <button className="btn-primary" style={{ background: '#FC642D', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={openExpModal}>
                <Plus size={18} /> Agregar Gasto
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)' }}>
                  {expSelectMode && <th style={{ padding: '12px', width: '36px' }} />}
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Descripción</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {expPagFC.paginated.map(exp => {
                  const isSel = selectedExps.has(exp.id);
                  return (
                    <tr
                      key={exp.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        background: isSel ? 'rgba(0,112,243,0.04)' : undefined,
                        outline: isSel ? '1px solid rgba(0,112,243,0.25)' : undefined,
                        cursor: expSelectMode ? 'pointer' : 'default',
                      }}
                      onClick={() => expSelectMode && toggleExpSelect(exp.id)}
                    >
                      {expSelectMode && (
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{
                            width: '18px', height: '18px', borderRadius: '4px', margin: '0 auto',
                            border: isSel ? 'none' : '2px solid var(--border-color)',
                            background: isSel ? 'var(--primary)' : 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSel && (
                              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                                <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        </td>
                      )}
                      <td style={{ padding: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{exp.description}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#FC642D' }}>-${exp.amount.toFixed(2)}</td>
                    </tr>
                  );
                })}
                {filteredExpenses.length === 0 && (
                  <tr><td colSpan={expSelectMode ? 4 : 3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>Sin gastos en este período.</td></tr>
                )}
              </tbody>
            </table>
            <PaginationBar {...expPagFC} />

            {/* Floating action bar */}
            {expSelectMode && selectedExps.size > 0 && (
              <div style={{
                position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                background: 'var(--text-main)', color: 'white', borderRadius: '16px',
                padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.28)', zIndex: 1000,
                fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                <span>{selectedExps.size} seleccionado{selectedExps.size !== 1 ? 's' : ''}</span>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.25)' }} />
                <button
                  onClick={handleDeleteExpSelected}
                  style={{
                    background: 'rgba(255,90,95,0.22)', color: '#FF8A8E', border: 'none',
                    borderRadius: '8px', padding: '6px 16px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Stay Modal (Add / Edit) ──────────────────────────────────────── */}
      {stayModalOpen && (() => {
        const tradMode       = stayForm.calcMode === 'TRADITIONAL';
        const pfMode         = stayForm.calcMode === 'PFISICA';
        const sdfMode        = stayForm.calcMode === 'SINDATOSFISCALES';
        const fsMode         = stayForm.calcMode === 'FUERASINFCTR';
        const fcMode         = stayForm.calcMode === 'FUERACONFCTR';
        const nights         = parseInt(stayForm.nights) || 1;
        const gt             = parseFloat(stayForm.guestTotal) || 0;
        const costoNoche     = gt > 0 ? gt / nights : 0;

        // ── AIRBNB Tradicional: todo se calcula desde gt ──────────────────
        const tradRoom       = gt > 0 ? gt / (1 + TRAD_OCC) : 0;
        const tradOccTax     = tradRoom * TRAD_OCC;
        const tradHostFee    = tradRoom * TRAD_CA * (1 + TRAD_IVA);
        const tradIvaLiq     = tradRoom * TRAD_IVA;
        const tradIvaRet     = tradRoom * TRAD_IVAR;
        const tradIsrRet     = tradRoom * TRAD_ISR;
        const tradTuGanas    = tradRoom + tradIvaLiq - tradHostFee - tradIvaRet - tradIsrRet;

        // ── P.FÍSICA: mismo flujo que Tradicional, ISR 4% ────────────────
        const pfRoom         = gt > 0 ? gt / (1 + PF_OCC) : 0;
        const pfOccTax       = pfRoom * PF_OCC;
        const pfHostFee      = pfRoom * PF_CA * (1 + PF_IVA);
        const pfIvaLiq       = pfRoom * PF_IVA;
        const pfIvaRet       = pfRoom * PF_IVAR;
        const pfIsrRet       = pfRoom * PF_ISR;
        const pfTuGanas      = pfRoom + pfIvaLiq - pfHostFee - pfIvaRet - pfIsrRet;

        // ── SIN DATOS FISCALES: IVA ret. 16%, ISR ret. 20% ───────────────
        const sdfRoom        = gt > 0 ? gt / (1 + SDF_OCC) : 0;
        const sdfOccTax      = sdfRoom * SDF_OCC;
        const sdfHostFee     = sdfRoom * SDF_CA * (1 + SDF_IVA);
        const sdfIvaLiq      = sdfRoom * SDF_IVA;
        const sdfIvaRet      = sdfRoom * SDF_IVAR;
        const sdfIsrRet      = sdfRoom * SDF_ISR;
        const sdfTuGanas     = sdfRoom + sdfIvaLiq - sdfHostFee - sdfIvaRet - sdfIsrRet;

        // ── FUERA SIN FACTURA: guest pays exactly room rate, no deductions ─
        const fsRoom         = gt;             // roomTariff = guestTotal
        const fsTuGanas      = gt;             // you keep everything

        // ── FUERA CON FACTURA: ISH 10% + IVA 16% — host keeps only base ──
        const fcRoom         = gt > 0 ? gt / FCFC_MULT : 0;
        const fcOccTax       = fcRoom * FCFC_ISH;
        const fcIva          = fcRoom * (1 + FCFC_ISH) * FCFC_IVA;
        const fcIvaLiq       = fcIva;           // IVA collected (= Imp. Aloj.)
        const fcIvaRet       = fcIva;           // IVA to SAT (cancels fcIvaLiq)
        const fcIsrRet       = 0;
        const fcTuGanas      = fcRoom;          // fcRoom + fcIvaLiq - fcIvaRet = fcRoom

        // ── Manual: back-calc desde hostTotal ────────────────────────────
        const hostTotalInput = parseFloat(stayForm.hostTotal) || 0;
        const AB_NET         = 1 - AB_HOST_FEE * (1 + AB_IVA) + AB_IVA - AB_IVA_RET - AB_ISR_RET;
        const manRoom        = hostTotalInput > 0 ? hostTotalInput / AB_NET : 0;
        const manHostFee     = manRoom * AB_HOST_FEE * (1 + AB_IVA);
        const manIvaLiq      = manRoom * AB_IVA;
        const manIvaRet      = manRoom * AB_IVA_RET;
        const manIsrRet      = manRoom * AB_ISR_RET;
        const manOccTax      = manRoom * (AB_IVA + AB_ISH);
        const manGuestFee    = Math.max(0, gt - manRoom - manOccTax);

        // ── Valores unificados para display ───────────────────────────────
        const autoMode       = tradMode || pfMode || sdfMode || fsMode || fcMode;
        const hasBreakdown   = autoMode ? gt > 0 : hostTotalInput > 0;
        const room           = tradMode ? tradRoom    : pfMode ? pfRoom    : sdfMode ? sdfRoom    : fsMode ? fsRoom    : fcMode ? fcRoom    : manRoom;
        const occTax         = tradMode ? tradOccTax  : pfMode ? pfOccTax  : sdfMode ? sdfOccTax  : fsMode ? 0        : fcMode ? fcOccTax  : manOccTax;
        const hostFee        = tradMode ? tradHostFee : pfMode ? pfHostFee : sdfMode ? sdfHostFee : fsMode ? 0        : fcMode ? 0         : manHostFee;
        const ivaLiq         = tradMode ? tradIvaLiq  : pfMode ? pfIvaLiq  : sdfMode ? sdfIvaLiq  : fsMode ? 0        : fcMode ? fcIvaLiq  : manIvaLiq;
        const ivaRet         = tradMode ? tradIvaRet  : pfMode ? pfIvaRet  : sdfMode ? sdfIvaRet  : fsMode ? 0        : fcMode ? fcIvaRet  : manIvaRet;
        const isrRet         = tradMode ? tradIsrRet  : pfMode ? pfIsrRet  : sdfMode ? sdfIsrRet  : fsMode ? 0        : fcMode ? fcIsrRet  : manIsrRet;
        const tuGanas        = tradMode ? tradTuGanas : pfMode ? pfTuGanas : sdfMode ? sdfTuGanas : fsMode ? fsTuGanas : fcMode ? fcTuGanas : hostTotalInput;
        const guestFee       = autoMode ? 0 : manGuestFee;

        const fmt = (n: number) =>
          '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const rowStyle: React.CSSProperties = {
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', gap: '8px',
        };

        return (
          <div className="modal-overlay" onClick={closeStayModal}>
            <div className="modal-content" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 style={{ fontSize: '20px', fontWeight: 700 }}>
                  {editingStay ? `Editar Estancia #${editingStay.stayNumber}` : 'Nueva Estancia'}
                </h3>
                <button className="modal-close" onClick={closeStayModal}><X size={24} /></button>
              </div>

              <div className="modal-body">

                {/* ── Nombre del huésped ──────────────────────────────── */}
                <div style={mfld}>
                  <label style={mlbl}>Nombre del huésped</label>
                  <input style={minp()} value={stayForm.guestName}
                    onChange={e => setStayForm(f => ({ ...f, guestName: e.target.value }))}
                    placeholder="Ej. Juan García" autoFocus />
                </div>

                {/* ── Fechas + Noches ─────────────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 90px', gap: '12px', ...mfld }}>
                  <div>
                    <label style={mlbl}>Fecha de llegada <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="date" style={minp(!!stayErrors.checkIn)} value={stayForm.checkIn}
                      onChange={e => handleCheckInChange(e.target.value)} />
                    {stayErrors.checkIn && <span className="form-error">{stayErrors.checkIn}</span>}
                  </div>
                  <div>
                    <label style={mlbl}>Fecha de salida</label>
                    <input type="date" style={minp()} value={stayForm.checkOut}
                      onChange={e => handleCheckOutChange(e.target.value)}
                      min={stayForm.checkIn || undefined} />
                  </div>
                  <div>
                    <label style={mlbl}>Noches <span style={{ color: '#EF4444' }}>*</span></label>
                    <input type="number" min={1} style={minp(!!stayErrors.nights)} value={stayForm.nights}
                      onChange={e => handleNightsChange(e.target.value)} placeholder="1" />
                    {stayErrors.nights && <span className="form-error">{stayErrors.nights}</span>}
                  </div>
                </div>

                {/* ── Dropdown: Tipo de calculadora ───────────────────── */}
                <div style={mfld}>
                  <label style={mlbl}>Calculadora</label>
                  <select
                    style={minp()}
                    value={stayForm.calcMode}
                    onChange={e => setStayForm(f => ({
                      ...f,
                      calcMode: e.target.value as StayForm['calcMode'],
                      hostTotal: '',
                    }))}
                  >
                    <optgroup label="— En Airbnb —">
                      <option value="TRADITIONAL">AIRBNB Tradicional — P.MORAL (ISR 2.5%)</option>
                      <option value="PFISICA">P.FÍSICA — Persona Física (ISR 4%)</option>
                      <option value="SINDATOSFISCALES">SIN DATOS FISCALES — IVA ret. 16% · ISR ret. 20%</option>
                    </optgroup>
                    <optgroup label="— Fuera de Airbnb —">
                      <option value="FUERASINFCTR">FUERA SIN FACTURA — Sin impuestos ni comisiones</option>
                      <option value="FUERACONFCTR">FUERA CON FACTURA — ISH 10% + IVA 16% a SAT</option>
                    </optgroup>
                    <optgroup label="— Manual —">
                      <option value="MANUAL">Manual — Ingresa el total del huésped y lo que tú ganas</option>
                    </optgroup>
                  </select>
                  {autoMode && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', lineHeight: 1.4 }}>
                      {tradMode
                        ? 'Fórmulas: Imp. ocupación 19.5% · Comisión Airbnb 15.5%+IVA · IVA liquidado 16% · IVA ret. 8% · ISR ret. 2.5%'
                        : pfMode
                          ? 'Fórmulas P.FÍSICA: Imp. ocupación 19.5% · Comisión Airbnb 15.5%+IVA · IVA liquidado 16% · IVA ret. 8% · ISR ret. 4%'
                          : sdfMode
                            ? 'Fórmulas SIN DATOS FISCALES: Imp. ocupación 19.5% · Comisión Airbnb 15.5%+IVA · IVA liquidado 16% · IVA ret. 16% · ISR ret. 20%'
                            : fsMode
                              ? 'Sin comisiones ni impuestos — el huésped paga exactamente lo que cobras y tú recibes el total'
                              : 'ISH 10% + IVA 16% sobre (renta+ISH) → huésped paga total con impuestos, tú guardas solo la renta base'
                      }
                    </div>
                  )}
                </div>

                {/* ── Sección de Ingresos ─────────────────────────────── */}
                <div style={{
                  border: '1.5px solid var(--border-color)', borderRadius: '12px',
                  overflow: 'hidden', marginBottom: '16px',
                }}>
                  {/* ── Inputs ── */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: autoMode ? '1fr' : '1fr 1fr',
                    borderBottom: '1.5px solid var(--border-color)',
                  }}>
                    {/* El huésped pagó */}
                    <div style={{ padding: '14px 16px', borderRight: autoMode ? 'none' : '1px solid var(--border-color)' }}>
                      <label style={mlbl}>
                        El huésped pagó (MXN)&nbsp;<span style={{ color: '#EF4444' }}>*</span>
                        {autoMode && (
                          <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px', fontSize: '11px' }}>
                            — Total incluye impuestos
                          </span>
                        )}
                      </label>
                      <input type="number" min={0} step={0.01} style={minp(!!stayErrors.guestTotal)}
                        value={stayForm.guestTotal}
                        onChange={e => setStayForm(f => ({ ...f, guestTotal: e.target.value }))}
                        placeholder="0.00" />
                      {stayErrors.guestTotal && <span className="form-error">{stayErrors.guestTotal}</span>}
                      {costoNoche > 0 && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '5px' }}>
                          Promedio: <strong style={{ color: 'var(--primary)' }}>{fmt(costoNoche)}</strong>/noche
                          {autoMode && room > 0 && (
                            <span style={{ marginLeft: '10px' }}>
                              · Renta base: <strong style={{ color: 'var(--success)' }}>{fmt(room / nights)}</strong>/noche
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tú ganas — solo en modo MANUAL */}
                    {!autoMode && (
                      <div style={{ padding: '14px 16px' }}>
                        <label style={mlbl}>Tú ganas (MXN)&nbsp;<span style={{ color: '#EF4444' }}>*</span></label>
                        <input type="number" min={0} step={0.01} style={minp(!!stayErrors.hostTotal)}
                          value={stayForm.hostTotal}
                          onChange={e => setStayForm(f => ({ ...f, hostTotal: e.target.value }))}
                          placeholder="0.00" />
                        {stayErrors.hostTotal && <span className="form-error">{stayErrors.hostTotal}</span>}
                      </div>
                    )}
                  </div>

                  {/* ── Tabs de desglose ── */}
                  <div style={{ display: 'flex', borderBottom: hasBreakdown ? '1.5px solid var(--border-color)' : 'none', background: 'var(--bg-color)' }}>
                    {(['host', 'guest'] as const).map(tab => (
                      <button key={tab} onClick={() => setIncomeTab(tab)} style={{
                        flex: 1, padding: '10px 16px', border: 'none', cursor: 'pointer',
                        fontFamily: 'inherit', fontWeight: 600, fontSize: '13px',
                        background: incomeTab === tab ? 'white' : 'transparent',
                        color: incomeTab === tab ? 'var(--text-main)' : 'var(--text-muted)',
                        borderBottom: incomeTab === tab ? '2px solid var(--text-main)' : '2px solid transparent',
                      }}>
                        {tab === 'host' ? 'Tú ganas' : 'El huésped pagó'}
                      </button>
                    ))}
                  </div>

                  {/* ── Panel de desglose calculado ── */}
                  {hasBreakdown ? (
                    <div style={{ padding: '10px 16px 14px' }}>
                      {incomeTab === 'host' ? (
                        <>
                          <div style={rowStyle}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              Costo de la renta ({nights} noche{nights !== 1 ? 's' : ''})
                            </span>
                            <span style={{ fontWeight: 600 }}>{fmt(room)}</span>
                          </div>
                          <div style={rowStyle}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              {(tradMode || pfMode || sdfMode)
                                ? '(-) Tarifa de servicio Airbnb (15.5% + IVA 16%)'
                                : fsMode
                                  ? '(-) Comisión plataforma'
                                  : fcMode
                                    ? '(-) Comisión plataforma'
                                    : '(-) Tarifa de servicio Airbnb (3.0% + IVA)'}
                            </span>
                            <span style={{ fontWeight: 600, color: '#FC642D' }}>
                              {hostFee === 0 ? '—' : `-${fmt(hostFee)}`}
                            </span>
                          </div>
                          <div style={rowStyle}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              {fcMode
                                ? '(+) IVA alojamiento cobrado al huésped (16%)'
                                : fsMode
                                  ? '(+) Impuesto alojamiento'
                                  : '(+) Impuesto alojamiento liquidado (IVA 16%)'}
                            </span>
                            <span style={{ fontWeight: 600 }}>{ivaLiq === 0 ? '—' : fmt(ivaLiq)}</span>
                          </div>
                          <div style={rowStyle}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              {fcMode
                                ? '(-) IVA remitido a SAT (16%) — cancela crédito'
                                : `(-) IVA retenido (${sdfMode ? '16% (Sin datos fiscales)' : '8%'})`}
                            </span>
                            <span style={{ fontWeight: 600, color: '#FC642D' }}>
                              {ivaRet === 0 ? '—' : `-${fmt(ivaRet)}`}
                            </span>
                          </div>
                          <div style={{ ...rowStyle, borderBottom: 'none' }}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              {fcMode
                                ? '(-) ISR retenido (0% — sin retención ISR)'
                                : fsMode
                                  ? '(-) ISR retenido (0%)'
                                  : `(-) ISR retenido en México (${tradMode ? '2.5%' : pfMode ? '4% (P.FÍSICA)' : sdfMode ? '20% (Sin datos fiscales)' : '4%'})`}
                            </span>
                            <span style={{ fontWeight: 600, color: '#FC642D' }}>
                              {isrRet === 0 ? '—' : `-${fmt(isrRet)}`}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1.5px solid var(--border-color)', marginTop: '6px' }}>
                            <span style={{ fontWeight: 700 }}>Tú ganas (MXN)</span>
                            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--success)' }}>{fmt(tuGanas)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={rowStyle}>
                            <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                              Costo de la renta ({nights} noche{nights !== 1 ? 's' : ''})
                            </span>
                            <span style={{ fontWeight: 600 }}>{fmt(room)}</span>
                          </div>
                          {!autoMode && (
                            <div style={rowStyle}>
                              <span style={{ color: 'var(--text-muted)', flex: 1 }}>Comisión por servicio al huésped</span>
                              <span style={{ fontWeight: 600 }}>{fmt(guestFee)}</span>
                            </div>
                          )}
                          {/* Occupation tax row — hidden for FUERASINFCTR (occTax=0, no markup) */}
                          {!(fsMode && occTax === 0) && (
                            <div style={fcMode ? rowStyle : { ...rowStyle, borderBottom: 'none' }}>
                              <span style={{ color: 'var(--text-muted)', flex: 1 }}>
                                {fcMode
                                  ? 'ISH 10% sobre renta base'
                                  : `Impuestos de ocupación (${(tradMode || pfMode || sdfMode) ? 'IVA+ISH 19.5%' : 'IVA 16% + ISH 3.5%'})`}
                              </span>
                              <span style={{ fontWeight: 600 }}>{occTax > 0 ? fmt(occTax) : '—'}</span>
                            </div>
                          )}
                          {/* IVA row — only for FUERACONFCTR */}
                          {fcMode && (
                            <div style={{ ...rowStyle, borderBottom: 'none' }}>
                              <span style={{ color: 'var(--text-muted)', flex: 1 }}>IVA 16% sobre (renta + ISH)</span>
                              <span style={{ fontWeight: 600 }}>{fmt(fcIva)}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '1.5px solid var(--border-color)', marginTop: '6px' }}>
                            <span style={{ fontWeight: 700 }}>Total (MXN)</span>
                            <span style={{ fontWeight: 800, fontSize: '15px' }}>{fmt(gt)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '14px', margin: 0 }}>
                      {autoMode
                        ? 'Ingresa el total del huésped para ver el desglose automático'
                        : 'Ingresa los montos arriba para ver el desglose'}
                    </p>
                  )}
                </div>

                {/* ── Gastos extras + Notas ───────────────────────────── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', ...mfld }}>
                  <div>
                    <label style={mlbl}>Gastos extras (MXN)</label>
                    <input type="number" min={0} step={0.01} style={minp()} value={stayForm.extraExpenses}
                      onChange={e => setStayForm(f => ({ ...f, extraExpenses: e.target.value }))} placeholder="0.00" />
                  </div>
                  <div>
                    <label style={mlbl}>Notas</label>
                    <input style={minp()} value={stayForm.notes}
                      onChange={e => setStayForm(f => ({ ...f, notes: e.target.value }))} placeholder="Observaciones..." />
                  </div>
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button className="btn-outline" onClick={closeStayModal}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSaveStay}>
                    {editingStay ? 'Guardar Cambios' : 'Agregar Estancia'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Expense Modal (Tab D) ────────────────────────────────────────── */}
      {expModalOpen && (
        <div className="modal-overlay" onClick={closeExpModal}>
          <div className="modal-content" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Agregar Gasto Extra</h3>
              <button className="modal-close" onClick={closeExpModal}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: '14px' }}>

              {/* Fecha */}
              <div>
                <label style={mlbl}>Fecha</label>
                <input type="date" style={minp()} value={expForm.date}
                  onChange={e => setExpForm(f => ({ ...f, date: e.target.value }))} />
              </div>

              {/* Descripción */}
              <div>
                <label style={mlbl}>Descripción <span style={{ color: '#EF4444' }}>*</span></label>
                <input style={minp(!!expErrors.description)} value={expForm.description}
                  onChange={e => setExpForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Ej. Reparación de cerradura" />
                {expErrors.description && <span style={{ color: '#EF4444', fontSize: '12px' }}>{expErrors.description}</span>}
              </div>

              {/* Categoría */}
              <div>
                <label style={mlbl}>Categoría</label>
                <select style={minp()} value={expForm.category}
                  onChange={e => setExpForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}>
                  <option value="cleaning">Limpieza</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="utilities">Servicios</option>
                  <option value="supplies">Insumos</option>
                  <option value="other">Otros</option>
                </select>
              </div>

              {/* Monto */}
              <div>
                <label style={mlbl}>Monto (MXN) <span style={{ color: '#EF4444' }}>*</span></label>
                <input type="number" min={0} step={0.01} style={minp(!!expErrors.amount)} value={expForm.amount}
                  onChange={e => setExpForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00" />
                {expErrors.amount && <span style={{ color: '#EF4444', fontSize: '12px' }}>{expErrors.amount}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
                <button className="btn-outline" onClick={closeExpModal}>Cancelar</button>
                <button className="btn-primary" style={{ background: '#FC642D' }} onClick={handleSaveExpense}>
                  Registrar Gasto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
