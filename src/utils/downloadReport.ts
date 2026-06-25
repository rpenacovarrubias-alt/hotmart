import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Stay, ReportConfig, ReportRow } from '../types';
import airbnbLogoUrl from '../assets/airbnb-logo.png';

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n);

// ── Custom Report Builder exports ─────────────────────────────────────────────

export function downloadCustomReportPDF(config: ReportConfig, rows: ReportRow[]) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte Personalizado', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Período: ${config.periodLabel}`, 14, 26);
  const propNames = config.propertyNames.length > 0 ? config.propertyNames.join(', ') : 'Todas';
  doc.text(`Propiedades: ${propNames}`, 14, 32);
  doc.text(`Métricas: ${config.selectedMetrics.map(m => m.label).join(', ')}`, 14, 38);

  const headers = ['Propiedad', ...config.selectedMetrics.map(m => m.label)];
  const body = rows.map(r => [
    r.propertyName,
    ...config.selectedMetrics.map(m => {
      const v = r[m.key];
      if (typeof v === 'number') return m.isPercent ? `${v.toFixed(1)}%` : fmtCurrency(v);
      return String(v ?? '—');
    }),
  ]);

  autoTable(doc, {
    head: [headers],
    body,
    startY: 46,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [255, 90, 95], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  doc.save(`reporte_${config.periodLabel.replace(/\s/g, '_')}.pdf`);
}

export async function downloadCustomReportExcel(config: ReportConfig, rows: ReportRow[]) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Reporte');

  ws.columns = [
    { header: 'Propiedad', key: 'prop', width: 30 },
    ...config.selectedMetrics.map(m => ({ header: m.label, key: m.key, width: 22 })),
  ];

  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF5A5F' } };

  rows.forEach(r => {
    const row: Record<string, string | number> = { prop: r.propertyName };
    config.selectedMetrics.forEach(m => {
      const v = r[m.key];
      row[m.key] = typeof v === 'number' ? v : 0;
    });
    ws.addRow(row);
  });

  config.selectedMetrics.forEach(m => {
    const col = ws.getColumn(m.key);
    col.numFmt = m.isPercent ? '0.0"%"' : '"$"#,##0';
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reporte_${config.periodLabel.replace(/\s/g, '_')}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

interface ReportSummary {
  totalNights: number;
  registeredIncome: number;
  airbnbCommission: number;
  afterAirbnb: number;
  cleaning: number;
  subtotal: number;
  cohostCommission: number;
  extraExpenses: number;
  netProfit: number;
  totalGuestPaid: number;
  totalHostEarned: number;
}

const fmtMXN = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 });

const CURRENCY_FMT = '$#,##0.00';
const THIN: Partial<ExcelJS.Border> = { style: 'thin' };
const RED_ARGB = 'FFFF7C80';

type BorderSides = { top?: boolean; bottom?: boolean; left?: boolean; right?: boolean };
function applyBorder(cell: ExcelJS.Cell, sides: BorderSides) {
  cell.border = {
    ...(sides.top    ? { top: THIN }    : {}),
    ...(sides.bottom ? { bottom: THIN } : {}),
    ...(sides.left   ? { left: THIN }   : {}),
    ...(sides.right  ? { right: THIN }  : {}),
  };
}

// ── Excel ─────────────────────────────────────────────────────────────────────

export async function downloadExcel(
  stays: Stay[],
  summary: ReportSummary,
  propertyName: string,
  periodLabel: string,
  ownerName: string,
  cohostName: string,
) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Airbnb CoHost App';
  wb.created = new Date();

  const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  const cohostPct = summary.subtotal > 0
    ? ((summary.cohostCommission / summary.subtotal) * 100).toFixed(0) : '20';

  // Helper: fetch logo as base64
  let logoBase64: string | null = null;
  try {
    const resp = await fetch(airbnbLogoUrl);
    const blob = await resp.blob();
    logoBase64 = await new Promise<string>((res) => {
      const reader = new FileReader();
      reader.onloadend = () => res((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
  } catch { /* skip if unavailable */ }

  // ── SHEET 1: Reporte Financiero ─────────────────────────────────────────────
  const ws1 = wb.addWorksheet('Reporte Financiero');

  ws1.columns = [
    { width: 3    }, // A — spacer
    { width: 30.3 }, // B — labels
    { width: 22.2 }, // C — values
    { width: 17.8 }, // D — date / logo area
    { width: 13   }, // E
    { width: 13   }, // F
    { width: 13   }, // G
  ];

  // Logo — LEFT side (columns A–B, rows 1–2)
  if (logoBase64) {
    const imgId = wb.addImage({ base64: logoBase64, extension: 'png' });
    ws1.addImage(imgId, {
      tl: { col: 0.1, row: 0.1 },
      ext: { width: 148, height: 32 },
    });
  }

  // Fecha de Impresión — top RIGHT (col D)
  const d2 = ws1.getCell('D2');
  d2.value = 'Fecha de Impresión'; d2.font = { size: 12 };

  const d3 = ws1.getCell('D3');
  d3.value = today; d3.font = { size: 12 }; d3.alignment = { horizontal: 'center' };

  // Row 4–5: Title (B4:C4, B5:C5 merged)
  ws1.mergeCells('B4:C4');
  const b4 = ws1.getCell('B4');
  b4.value = 'REPORTE FINANCIERO DE PROPIEDAD';
  b4.font = { bold: true, size: 12 }; b4.alignment = { horizontal: 'center' };

  ws1.mergeCells('B5:C5');
  const b5 = ws1.getCell('B5');
  b5.value = 'Airbnb Co-Anfitrión Management';
  b5.font = { size: 12 }; b5.alignment = { horizontal: 'center' };

  // Rows 7–9: Property info
  const infoRows: [string, string, string, string][] = [
    ['B7', 'Propiedad:', 'C7', propertyName],
    ['B8', 'Período:',   'C8', periodLabel  ],
    ['B9', 'Generado:',  'C9', today        ],
  ];
  infoRows.forEach(([la, lv, va, vv]) => {
    const lc = ws1.getCell(la); lc.value = lv; lc.font = { bold: true, size: 12 }; lc.alignment = { horizontal: 'right' };
    const vc = ws1.getCell(va); vc.value = vv; vc.font = { size: 12 };
  });

  // Row 11: RESUMEN EJECUTIVO (B11:C11 merged)
  ws1.mergeCells('B11:C11');
  const reh = ws1.getCell('B11');
  reh.value = 'RESUMEN EJECUTIVO'; reh.font = { bold: true, size: 12 };
  reh.alignment = { horizontal: 'center' };
  applyBorder(reh, { left: true, right: true, top: true });

  // Row 12: Headers
  const b12 = ws1.getCell('B12'); b12.value = 'Concepto'; b12.font = { size: 12 }; b12.alignment = { horizontal: 'center' }; applyBorder(b12, { left: true, bottom: true });
  const c12 = ws1.getCell('C12'); c12.value = 'Valor';    c12.font = { size: 12 }; c12.alignment = { horizontal: 'center' }; applyBorder(c12, { right: true, bottom: true });

  // Rows 13–16: Executive data
  const avgNPP = stays.length ? (summary.totalNights / stays.length).toFixed(1) : '0';

  const execData: [string, string | number, boolean][] = [
    ['Total Estancias',             stays.length,                           false],
    ['Total Noches',                summary.totalNights,                    false],
    ['Promedio Noches / Estancia',  avgNPP,                                 false],
    ['Promedio Utilidad / Noche',   summary.totalNights ? summary.netProfit / summary.totalNights : 0, true],
  ];
  execData.forEach(([label, val, isCurrency], i) => {
    const row = 13 + i;
    const bl = ws1.getCell(`B${row}`); bl.value = label as string; bl.font = { size: 12 };
    const cl = ws1.getCell(`C${row}`); cl.value = val; cl.font = { size: 12 }; cl.alignment = { horizontal: 'center' };
    if (isCurrency) cl.numFmt = CURRENCY_FMT;
  });

  // Row 18: RESUMEN FINANCIERO (B18:C18 merged)
  ws1.mergeCells('B18:C18');
  const rfh = ws1.getCell('B18');
  rfh.value = 'RESUMEN FINANCIERO'; rfh.font = { bold: true, size: 12 };
  rfh.alignment = { horizontal: 'center' };
  applyBorder(rfh, { left: true, right: true, top: true });

  // Row 19: Headers
  const b19 = ws1.getCell('B19'); b19.value = 'Concepto';    b19.font = { size: 12 }; b19.alignment = { horizontal: 'center' }; applyBorder(b19, { left: true, bottom: true });
  const c19 = ws1.getCell('C19'); c19.value = 'Monto (MXN)'; c19.font = { size: 12 }; c19.alignment = { horizontal: 'center' }; applyBorder(c19, { right: true, bottom: true });

  // Rows 20–28: Financial rows
  const finRows: [string, number, boolean][] = [
    ['Ingreso Registrado (Huésped Pagó)',           summary.totalGuestPaid,                                   false],
    ['Total Tú Ganas (Neto Airbnb)',                summary.totalHostEarned,                                  false],
    ['Ingreso Registrado (Base cálculo)',            summary.registeredIncome,                                 false],
    ['- Comisión Airbnb',                           -summary.airbnbCommission,                                true ],
    ['Después de Airbnb',                           summary.afterAirbnb,                                      false],
    ['- Limpieza',                                  -summary.cleaning,                                        true ],
    ['Subtotal',                                    summary.subtotal,                                         false],
    [`- Com. Co-Anfitrión (${cohostPct}% Subtotal)`, -summary.cohostCommission,                              true ],
    ['- Gastos Extras',                             summary.extraExpenses > 0 ? -summary.extraExpenses : 0,  false],
  ];
  finRows.forEach(([label, val, isRed], i) => {
    const row   = 20 + i;
    const color = isRed ? { argb: RED_ARGB } : undefined;
    const bl = ws1.getCell(`B${row}`); bl.value = label; bl.font = { size: 12, color };
    const cl = ws1.getCell(`C${row}`); cl.value = val;   cl.font = { size: 12, color }; cl.numFmt = CURRENCY_FMT;
  });

  // Row 29: UTILIDAD NETA
  const b29 = ws1.getCell('B29'); b29.value = 'UTILIDAD NETA'; b29.font = { bold: true, size: 12 }; applyBorder(b29, { left: true, top: true, bottom: true });
  const c29 = ws1.getCell('C29'); c29.value = summary.netProfit; c29.font = { bold: true, size: 12 }; c29.numFmt = CURRENCY_FMT; applyBorder(c29, { right: true, top: true, bottom: true });

  // Row 31: FIRMAS
  ws1.mergeCells('B31:C31');
  const b31 = ws1.getCell('B31'); b31.value = 'FIRMAS'; b31.font = { size: 12 }; b31.alignment = { horizontal: 'center' };

  const b32 = ws1.getCell('B32'); b32.value = 'Propietario:';  b32.font = { size: 12 }; b32.alignment = { horizontal: 'center' };
  const c32 = ws1.getCell('C32'); c32.value = ownerName;       c32.font = { size: 12 }; c32.alignment = { horizontal: 'center' };

  const b33 = ws1.getCell('B33'); b33.value = 'Co-Anfitrión:'; b33.font = { size: 12 }; b33.alignment = { horizontal: 'center' }; applyBorder(b33, { bottom: true });
  const c33 = ws1.getCell('C33'); c33.value = cohostName;       c33.font = { size: 12 }; c33.alignment = { horizontal: 'center' }; applyBorder(c33, { bottom: true });

  // ── SHEET 2: Detalle Estancias ──────────────────────────────────────────────
  const ws2 = wb.addWorksheet('Detalle Estancias');

  ws2.columns = [
    { width: 16.2 }, // A
    { width: 14.8 }, // B
    { width: 13   }, // C — labels
    { width: 13   }, // D — values
    { width: 17.8 }, // E — date area
  ];

  // Fecha de Impresión — top RIGHT (col E, matching sheet 1 style)
  const e2 = ws2.getCell('E2'); e2.value = 'Fecha de Impresión '; e2.font = { size: 11 };
  const e3 = ws2.getCell('E3'); e3.value = today; e3.font = { size: 11 };

  // Title B4:E6 merged
  ws2.mergeCells('B4:E6');
  const ws2Title = ws2.getCell('B4');
  ws2Title.value = 'Reporte a Detalle Por Huésped por Período';
  ws2Title.font = { size: 16 }; ws2Title.alignment = { horizontal: 'center', vertical: 'middle' };

  // Card layout constants
  const CARD_HEIGHT = 22;
  const CARD_GAP    = 2;

  type CardField = {
    label: string;
    getValue: (s: Stay) => string | number;
    isRed: boolean;
    isBold: boolean;
    isCurrency?: boolean;
    borderBottom?: boolean;
    borderBox?: boolean;
    centerAlign?: boolean;
  };

  const cardFields: CardField[] = [
    { label: '#',              getValue: s => s.stayNumber,                                         isRed: false, isBold: true,  centerAlign: true  },
    { label: 'Huésped',        getValue: s => s.guestName ?? '—',                                   isRed: false, isBold: false                     },
    { label: 'Llegada',        getValue: s => s.date,                                               isRed: false, isBold: true                      },
    { label: 'Salida',         getValue: s => s.checkOut ?? '—',                                    isRed: false, isBold: false                     },
    { label: 'Noches',         getValue: s => s.nights,                                             isRed: false, isBold: true                      },
    { label: 'H. Pagó',        getValue: s => s.guestTotal ?? 0,                                    isRed: false, isBold: false, isCurrency: true   },
    { label: 'Tarifa Hab.',    getValue: s => s.guestRoomTariff ?? 0,                               isRed: false, isBold: true,  isCurrency: true   },
    { label: 'Svc. Huesp.',    getValue: s => s.guestServiceFee ?? 0,                               isRed: false, isBold: false, isCurrency: true   },
    { label: 'Imp. Ocup.',     getValue: s => s.guestOccupationTax ?? 0,                            isRed: false, isBold: true,  isCurrency: true   },
    { label: 'Svc. Anfitr.',   getValue: s => s.hostServiceFeeAmount ? -s.hostServiceFeeAmount : 0, isRed: true,  isBold: true,  isCurrency: true   },
    { label: 'Imp. Aloj.',     getValue: s => s.lodgingTaxLiquidated ?? 0,                          isRed: false, isBold: true,  isCurrency: true   },
    { label: 'IVA Ret.',       getValue: s => s.ivaRetained ? -s.ivaRetained : 0,                   isRed: false, isBold: false, isCurrency: true   },
    { label: 'ISR Ret.',       getValue: s => s.isrRetained ? -s.isrRetained : 0,                   isRed: true,  isBold: true,  isCurrency: true   },
    { label: 'Tú Ganas',       getValue: s => s.hostTotal ?? 0,                                     isRed: false, isBold: false, isCurrency: true   },
    { label: 'Ingreso Reg.',   getValue: s => s.registeredIncome,                                   isRed: false, isBold: true,  isCurrency: true,  borderBottom: true },
    { label: 'Airbnb',         getValue: s => -s.airbnbCommission,                                  isRed: true,  isBold: true,  isCurrency: true   },
    { label: 'Después Airbnb', getValue: s => s.afterAirbnb,                                        isRed: false, isBold: true,  isCurrency: true   },
    { label: 'Limpieza',       getValue: s => -s.cleaningFee,                                       isRed: true,  isBold: false, isCurrency: true   },
    { label: 'Subtotal',       getValue: s => s.subtotal,                                           isRed: false, isBold: true,  isCurrency: true   },
    { label: 'Com. Coan.',     getValue: s => -s.cohostCommission,                                  isRed: true,  isBold: false, isCurrency: true   },
    { label: 'Extras',         getValue: s => s.extraExpenses > 0 ? s.extraExpenses : 0,           isRed: false, isBold: true,  isCurrency: true   },
    { label: 'Utilidad Neta',  getValue: s => s.netProfit,                                          isRed: false, isBold: false, isCurrency: true,  borderBox: true },
  ];

  stays.forEach((stay, idx) => {
    const startRow = 7 + idx * (CARD_HEIGHT + CARD_GAP);

    cardFields.forEach((field, i) => {
      const rowNum = startRow + i;
      const color  = field.isRed ? { argb: RED_ARGB } : undefined;

      const lc = ws2.getCell(`C${rowNum}`);
      lc.value = field.label;
      lc.font  = { size: 12, bold: field.isBold, color };

      const vc = ws2.getCell(`D${rowNum}`);
      vc.value     = field.getValue(stay);
      vc.font      = { size: 12, bold: field.isBold, color };
      vc.alignment = { horizontal: field.centerAlign ? 'center' : 'left' };
      if (field.isCurrency) vc.numFmt = CURRENCY_FMT;

      if (field.borderBottom) {
        applyBorder(lc, { bottom: true }); applyBorder(vc, { bottom: true });
      }
      if (field.borderBox) {
        applyBorder(lc, { left: true, top: true, bottom: true });
        applyBorder(vc, { right: true, top: true, bottom: true });
      }
    });
  });

  // TOTALES — formula matches template: last card row + 5
  const lastCardRow = 7 + (stays.length - 1) * (CARD_HEIGHT + CARD_GAP) + CARD_HEIGHT - 1;
  const totalsRow   = lastCardRow + 5;

  const tot0 = ws2.getCell(`C${totalsRow}`);     tot0.value = 'TOTALES'; tot0.font = { bold: true, size: 12 };

  const tot1L = ws2.getCell(`C${totalsRow + 1}`); tot1L.value = 'Ingresos'; tot1L.font = { bold: true, size: 12 }; applyBorder(tot1L, { left: true, top: true });
  const tot1V = ws2.getCell(`D${totalsRow + 1}`); tot1V.value = summary.totalGuestPaid; tot1V.font = { bold: true, size: 12 }; tot1V.numFmt = CURRENCY_FMT; applyBorder(tot1V, { right: true, top: true });

  const tot2L = ws2.getCell(`C${totalsRow + 2}`); tot2L.value = 'Noches'; tot2L.font = { size: 12 }; applyBorder(tot2L, { left: true, bottom: true });
  const tot2V = ws2.getCell(`D${totalsRow + 2}`); tot2V.value = summary.totalNights; tot2V.font = { size: 12 }; applyBorder(tot2V, { right: true, bottom: true });

  // ── Write and trigger browser download ───────────────────────────────────────
  const buffer = await wb.xlsx.writeBuffer();
  const blob   = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url    = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href  = url;
  anchor.download = `Reporte_Airbnb_${propertyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ── PDF ──────────────────────────────────────────────────────────────────────
// Landscape A4 (297×210mm) so 13 columns fit without wrapping

export function downloadPDF(
  stays: Stay[],
  summary: ReportSummary,
  propertyName: string,
  periodLabel: string,
  ownerName: string,
  cohostName: string,
) {
  const doc    = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW  = doc.internal.pageSize.getWidth();   // 297mm
  const pageH  = doc.internal.pageSize.getHeight();  // 210mm
  const MARGIN = 14;
  const USABLE = pageW - MARGIN * 2;                 // 269mm

  const AIRBNB = '#FF5A5F';
  const ORANGE = '#FC642D';
  const GRAY   = '#717171';
  const BLACK  = '#222222';

  let y = 0;

  // ── Header ────────────────────────────────────────────────────────────────
  doc.setFillColor('#FFFFFF');
  doc.rect(0, 0, pageW, 20, 'F');
  doc.setDrawColor('#E5E7EB');
  doc.line(0, 20, pageW, 20);

  // Logo left
  doc.addImage(airbnbLogoUrl, 'PNG', MARGIN, 5, 40, 10);

  // Title center
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(AIRBNB);
  doc.text('Reporte Financiero de Propiedad', pageW / 2, 12, { align: 'center' });

  // Date right
  const today = new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(GRAY);
  doc.text(today, pageW - MARGIN, 12, { align: 'right' });

  y = 28;

  // Property + period
  doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(BLACK);
  doc.text(propertyName, MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(GRAY);
  doc.text(`Período: ${periodLabel}  |  ${stays.length} estancias  |  ${summary.totalNights} noches`, MARGIN, y);
  y += 6;

  doc.setDrawColor('#E5E7EB');
  doc.line(MARGIN, y, pageW - MARGIN, y);
  y += 6;

  // ── Two-column summary ────────────────────────────────────────────────────
  const cohostPct  = summary.subtotal > 0 ? ((summary.cohostCommission / summary.subtotal) * 100).toFixed(0) : '20';
  const colW       = (USABLE - 10) / 2;
  const colRight   = MARGIN + colW + 10;
  const avgNPP     = stays.length ? (summary.totalNights / stays.length).toFixed(1) : '0';
  const avgUPN     = summary.totalNights ? fmtMXN(summary.netProfit / summary.totalNights) : fmtMXN(0);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(GRAY);
  doc.text('RESUMEN EJECUTIVO',  MARGIN, y);
  doc.text('RESUMEN FINANCIERO', colRight, y);
  y += 5;

  const execRows: [string, string][] = [
    ['Total Estancias',            String(stays.length)],
    ['Total Noches',               String(summary.totalNights)],
    ['Promedio Noches / Estancia', avgNPP],
    ['Promedio Utilidad / Noche',  avgUPN],
  ];

  const finRows: [string, string, boolean][] = [
    ['Ingreso Registrado',                 fmtMXN(summary.registeredIncome),       false],
    ['- Comisión Airbnb',                  `-${fmtMXN(summary.airbnbCommission)}`,  true ],
    ['Después de Airbnb',                  fmtMXN(summary.afterAirbnb),            false],
    ['- Limpieza',                         `-${fmtMXN(summary.cleaning)}`,          true ],
    ['Subtotal',                           fmtMXN(summary.subtotal),               false],
    [`- Com. Co-Anfitrión (${cohostPct}%)`, `-${fmtMXN(summary.cohostCommission)}`, true ],
    ['- Gastos Extras',                    `-${fmtMXN(summary.extraExpenses)}`,     true ],
  ];

  const rowH   = 5.5;
  const startY = y;

  execRows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(BLACK);
    doc.text(label, MARGIN, y);
    doc.text(val, MARGIN + colW, y, { align: 'right' });
    y += rowH;
  });

  y = startY;
  finRows.forEach(([label, val, isNeg]) => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(isNeg ? ORANGE : BLACK);
    doc.text(label, colRight, y);
    doc.text(val, colRight + colW, y, { align: 'right' });
    y += rowH;
  });

  // Utilidad Neta highlighted box
  doc.setFillColor('#F0FFF4'); doc.setDrawColor('#22C55E');
  doc.roundedRect(colRight, y, colW, 9, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor('#16A34A');
  doc.text('Utilidad Neta', colRight + 3, y + 5.8);
  doc.setFontSize(10);
  doc.text(fmtMXN(summary.netProfit), colRight + colW - 3, y + 5.8, { align: 'right' });
  y += 14;

  // ── Distribution bar ───────────────────────────────────────────────────────
  if (summary.registeredIncome > 0) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(GRAY);
    doc.text('DISTRIBUCIÓN DEL INGRESO', MARGIN, y);
    y += 4;

    const barW = USABLE; const barH = 6;
    const total = summary.registeredIncome;
    const segs: [string, number][] = [
      [AIRBNB, summary.airbnbCommission / total],
      ['#FFB020', summary.cleaning / total],
      ['#FF5A5F', summary.cohostCommission / total],
      ['#22C55E', Math.max(0, summary.netProfit / total)],
    ];
    let bx = MARGIN;
    segs.forEach(([color, pct]) => {
      const w = Math.max(0, barW * pct);
      doc.setFillColor(color); doc.rect(bx, y, w, barH, 'F'); bx += w;
    });
    y += barH + 3;

    const legend: [string, string][] = [[AIRBNB,'Airbnb'],['#FFB020','Limpieza'],['#FF5A5F','Co-Anfitrión'],['#22C55E','Propietario']];
    let lx = MARGIN;
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    legend.forEach(([color, label]) => {
      doc.setFillColor(color); doc.circle(lx + 2, y + 2, 1.8, 'F');
      doc.setTextColor(GRAY); doc.text(label, lx + 6, y + 3.5); lx += 40;
    });
    y += 9;
  }

  // ── Stays table ─────────────────────────────────────────────────────────────
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(GRAY);
  doc.text('DETALLE DE ESTANCIAS', MARGIN, y);
  y += 4;

  const stayRows = stays.map(s => [
    String(s.stayNumber),
    s.guestName ?? '—',
    s.date,
    s.checkOut ?? '—',
    String(s.nights),
    s.guestTotal        ? fmtMXN(s.guestTotal)              : '—',
    s.hostTotal         ? fmtMXN(s.hostTotal)               : '—',
    fmtMXN(s.registeredIncome),
    fmtMXN(-s.airbnbCommission),
    fmtMXN(s.afterAirbnb),
    fmtMXN(-s.cleaningFee),
    fmtMXN(s.subtotal),
    fmtMXN(-s.cohostCommission),
    fmtMXN(s.netProfit),
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      '#', 'Huésped', 'Llegada', 'Salida', 'Nts',
      'H. Pagó', 'Tú Ganas',
      'Ing. Reg.', 'Airbnb', 'Desp. Airbnb',
      'Limpieza', 'Subtotal', 'Com. Coan.', 'Utilidad Neta',
    ]],
    body: stayRows,
    foot: [[
      // "TOTALES" spans first 5 cols so it never wraps
      { content: 'TOTALES', colSpan: 4, styles: { halign: 'left', fontStyle: 'bold' } },
      String(summary.totalNights),
      fmtMXN(summary.totalGuestPaid),   fmtMXN(summary.totalHostEarned),
      fmtMXN(summary.registeredIncome), fmtMXN(-summary.airbnbCommission),
      fmtMXN(summary.afterAirbnb),      fmtMXN(-summary.cleaning),
      fmtMXN(summary.subtotal),         fmtMXN(-summary.cohostCommission),
      fmtMXN(summary.netProfit),
    ]],
    theme: 'striped',
    styles:             { fontSize: 8, cellPadding: 2, overflow: 'linebreak', font: 'helvetica' },
    headStyles:         { fillColor: '#FF5A5F', textColor: '#FFFFFF', fontStyle: 'bold', fontSize: 8, halign: 'center' },
    footStyles:         { fillColor: '#F3F4F6', textColor: BLACK, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: '#FFF5F5' },
    // Column widths must sum to ≤ USABLE (269mm): 9+26+20+20+9+22+22+20+20+22+18+18+20+23 = 269
    columnStyles: {
      0:  { cellWidth:  9, halign: 'center' },  // #
      1:  { cellWidth: 26                   },  // Huésped
      2:  { cellWidth: 20                   },  // Llegada
      3:  { cellWidth: 20                   },  // Salida
      4:  { cellWidth:  9, halign: 'center' },  // Nts
      5:  { cellWidth: 22, halign: 'right'  },  // H. Pagó
      6:  { cellWidth: 22, halign: 'right'  },  // Tú Ganas
      7:  { cellWidth: 20, halign: 'right'  },  // Ing. Reg.
      8:  { cellWidth: 20, halign: 'right'  },  // Airbnb
      9:  { cellWidth: 22, halign: 'right'  },  // Desp. Airbnb
      10: { cellWidth: 18, halign: 'right'  },  // Limpieza
      11: { cellWidth: 18, halign: 'right'  },  // Subtotal
      12: { cellWidth: 20, halign: 'right'  },  // Com. Coan.
      13: { cellWidth: 23, halign: 'right'  },  // Utilidad Neta
    },
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: USABLE,
  });

  // ── Signature lines ───────────────────────────────────────────────────────
  const finalY: number = (doc as any).lastAutoTable?.finalY ?? pageH - 30;
  const sigY = Math.min(finalY + 10, pageH - 22);

  doc.setDrawColor('#9CA3AF');
  doc.line(MARGIN,      sigY + 12, MARGIN + 60,      sigY + 12);
  doc.line(MARGIN + 80, sigY + 12, MARGIN + 80 + 60, sigY + 12);
  doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(GRAY);
  doc.text('Propietario',   MARGIN,          sigY + 17); doc.text(ownerName,  MARGIN,          sigY + 22);
  doc.text('Co-Anfitrión',  MARGIN + 80,     sigY + 17); doc.text(cohostName, MARGIN + 80,     sigY + 22);

  doc.save(`Reporte_Airbnb_${propertyName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
