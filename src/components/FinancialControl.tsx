import { useState, useMemo } from 'react';
import { Download, FileText, Plus, Save } from 'lucide-react';
import { mockPropertyConfigs, mockStays, mockExtraExpenses } from '../data/mockData';
import type { Stay, ExtraExpense, PropertyConfig } from '../types';

export default function FinancialControl({ propertyId }: { propertyId: string }) {
  const [activeTab, setActiveTab] = useState<'config'|'stays'|'report'|'expenses'>('stays');
  const [period, setPeriod] = useState('month');
  
  const [config] = useState<PropertyConfig | undefined>(mockPropertyConfigs.find(c => c.propertyId === propertyId));
  const [stays] = useState<Stay[]>(mockStays.filter(s => s.propertyId === propertyId));
  const [expenses] = useState<ExtraExpense[]>(mockExtraExpenses.filter(e => e.propertyId === propertyId));

  const now = new Date();
  const filterByDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'week') {
       const diff = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
       return diff >= 0 && diff <= 7;
    }
    if (period === 'today') return d.toDateString() === now.toDateString();
    return true;
  };

  const filteredStays = stays.filter(s => filterByDate(s.date));
  const filteredExpenses = expenses.filter(e => filterByDate(e.date));

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configuración guardada exitosamente.');
  };

  const reportSummary = useMemo(() => {
    return filteredStays.reduce((acc, stay) => {
      acc.totalNights += stay.nights;
      acc.registeredIncome += stay.registeredIncome;
      acc.airbnbCommission += stay.airbnbCommission;
      acc.afterAirbnb += stay.afterAirbnb;
      acc.cleaning += stay.cleaningFee;
      acc.subtotal += stay.subtotal;
      acc.cohostCommission += stay.cohostCommission;
      acc.extraExpenses += stay.extraExpenses;
      acc.netProfit += stay.netProfit;
      return acc;
    }, { totalNights: 0, registeredIncome: 0, airbnbCommission: 0, afterAirbnb: 0, cleaning: 0, subtotal: 0, cohostCommission: 0, extraExpenses: 0, netProfit: 0 });
  }, [filteredStays]);

  if (!config) return <div>Configuración no encontrada.</div>;

  return (
    <div style={{ marginTop: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Control Financiero</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-outline" onClick={()=>setPeriod('month')} style={{padding:'6px 12px', fontSize:'12px', background: period==='month'?'var(--primary)':'', color: period==='month'?'white':''}}>Este mes</button>
          <button className="btn-outline" onClick={()=>setPeriod('week')} style={{padding:'6px 12px', fontSize:'12px', background: period==='week'?'var(--primary)':'', color: period==='week'?'white':''}}>Semana actual</button>
          <button className="btn-outline" onClick={()=>setPeriod('today')} style={{padding:'6px 12px', fontSize:'12px', background: period==='today'?'var(--primary)':'', color: period==='today'?'white':''}}>Hoy</button>
          <button className="btn-outline" onClick={()=>setPeriod('custom')} style={{padding:'6px 12px', fontSize:'12px', background: period==='custom'?'var(--primary)':'', color: period==='custom'?'white':''}}>Todo Histórico</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <button onClick={() => setActiveTab('config')} style={{ background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, color: activeTab==='config'?'var(--primary)':'var(--text-muted)', borderBottom: activeTab==='config'?'2px solid var(--primary)':'2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>A. Configuración</button>
        <button onClick={() => setActiveTab('stays')} style={{ background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, color: activeTab==='stays'?'var(--primary)':'var(--text-muted)', borderBottom: activeTab==='stays'?'2px solid var(--primary)':'2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>B. Registro de Estancias</button>
        <button onClick={() => setActiveTab('report')} style={{ background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, color: activeTab==='report'?'var(--primary)':'var(--text-muted)', borderBottom: activeTab==='report'?'2px solid var(--primary)':'2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>C. Reporte del Período</button>
        <button onClick={() => setActiveTab('expenses')} style={{ background: 'none', border: 'none', padding: '12px 16px', fontWeight: 600, color: activeTab==='expenses'?'var(--primary)':'var(--text-muted)', borderBottom: activeTab==='expenses'?'2px solid var(--primary)':'2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>D. Gastos Extras</button>
      </div>

      <div className="property-card" style={{ padding: '24px', overflowX: 'auto' }}>
        {activeTab === 'config' && (
          <form onSubmit={handleConfigSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group"><label className="form-label">Propietario</label><input type="text" className="form-input" defaultValue={config.ownerName} /></div>
              <div className="form-group"><label className="form-label">Co-Anfitrión</label><input type="text" className="form-input" defaultValue={config.cohostName} /></div>
              <div className="form-group"><label className="form-label">Precio x Noche Base</label><input type="number" className="form-input" defaultValue={config.nightlyRate} /></div>
              <div className="form-group"><label className="form-label">Costo de Limpieza</label><input type="number" className="form-input" defaultValue={config.cleaningFee} /></div>
              <div className="form-group"><label className="form-label">Comisión Airbnb (%)</label><input type="number" step="0.01" className="form-input" defaultValue={config.airbnbCommission * 100} /></div>
              <div className="form-group"><label className="form-label">Comisión Ricardo (%)</label><input type="number" step="0.01" className="form-input" defaultValue={config.cohostCommission * 100} /></div>
              <div className="form-group">
                <label className="form-label">Modo de Registro</label>
                <select className="form-input" defaultValue={config.incomeMode}>
                  <option value="BEFORE">ANTES (Ingreso Bruto cobrado al huésped)</option>
                  <option value="AFTER">DESPUÉS (Lo que deposita Airbnb)</option>
                </select>
                <small style={{color:'var(--text-muted)'}}>Si es ANTES, el sistema restará la comisión de Airbnb. Si es DESPUÉS, asume que Airbnb ya descontó su comisión.</small>
              </div>
              <div className="form-group"><label className="form-label">Mínimo de Noches</label><input type="number" className="form-input" defaultValue={config.minNights} /></div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary"><Save size={18} /> Guardar Configuración</button>
            </div>
          </form>
        )}

        {activeTab === 'stays' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn-primary" style={{ background: 'var(--success)' }}><Plus size={18}/> Agregar Estancia</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', minWidth: '900px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Noches</th>
                  <th style={{ padding: '12px' }}>Ingreso Reg.</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Airbnb</th>
                  <th style={{ padding: '12px' }}>Después Airbnb</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Limpieza</th>
                  <th style={{ padding: '12px' }}>Subtotal</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Mi Comis.</th>
                  <th style={{ padding: '12px', color: '#FC642D' }}>Extras</th>
                  <th style={{ padding: '12px', color: 'var(--success)' }}>Utilidad Neta</th>
                </tr>
              </thead>
              <tbody>
                {filteredStays.map(stay => (
                  <tr key={stay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px', textAlign: 'left' }}>{stay.stayNumber}</td>
                    <td style={{ padding: '12px', textAlign: 'left' }}>{new Date(stay.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{stay.nights}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>${stay.registeredIncome.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.airbnbCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>${stay.afterAirbnb.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.cleaningFee.toFixed(2)}</td>
                    <td style={{ padding: '12px', fontWeight: 600 }}>${stay.subtotal.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#FC642D', fontWeight: 600 }}>-${stay.cohostCommission.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: '#FC642D' }}>-${stay.extraExpenses.toFixed(2)}</td>
                    <td style={{ padding: '12px', color: 'var(--success)', fontWeight: 700 }}>${stay.netProfit.toFixed(2)}</td>
                  </tr>
                ))}
                {/* Fila de Totales */}
                <tr style={{ background: 'var(--bg-color)', fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: '12px', textAlign: 'left' }}>TOTALES</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{reportSummary.totalNights}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.registeredIncome.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.airbnbCommission.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.afterAirbnb.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.cleaning.toFixed(2)}</td>
                  <td style={{ padding: '12px' }}>${reportSummary.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.cohostCommission.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: '#FC642D' }}>-${reportSummary.extraExpenses.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: 'var(--success)' }}>${reportSummary.netProfit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

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
                <div className="detail-row"><div className="detail-label" style={{color: '#FC642D'}}>- Comisión Airbnb</div><div className="detail-value" style={{color: '#FC642D'}}>-${reportSummary.airbnbCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{fontWeight:600}}>Después de Airbnb</div><div className="detail-value" style={{fontWeight:600}}>${reportSummary.afterAirbnb.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{color: '#FC642D'}}>- Limpieza</div><div className="detail-value" style={{color: '#FC642D'}}>-${reportSummary.cleaning.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{fontWeight:600}}>Subtotal</div><div className="detail-value" style={{fontWeight:600}}>${reportSummary.subtotal.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{color: '#FF5A5F'}}>- Comisión Ricardo</div><div className="detail-value" style={{color: '#FF5A5F'}}>-${reportSummary.cohostCommission.toFixed(2)}</div></div>
                <div className="detail-row"><div className="detail-label" style={{color: '#FC642D'}}>- Gastos Extras</div><div className="detail-value" style={{color: '#FC642D'}}>-${reportSummary.extraExpenses.toFixed(2)}</div></div>
                <div className="detail-row" style={{borderTop: '2px solid var(--border-color)', marginTop: '8px'}}><div className="detail-label" style={{fontWeight:700, color: 'var(--text-main)'}}>Utilidad Neta</div><div className="detail-value" style={{fontWeight:800, fontSize: '18px', color: 'var(--success)'}}>${reportSummary.netProfit.toFixed(2)}</div></div>
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
                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width:10,height:10,background:'#FC642D',borderRadius:'50%'}}></div> Airbnb</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width:10,height:10,background:'#FFB020',borderRadius:'50%'}}></div> Limpieza</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width:10,height:10,background:'#FF5A5F',borderRadius:'50%'}}></div> Co-Anfitrión</span>
                <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={{width:10,height:10,background:'var(--success)',borderRadius:'50%'}}></div> Propietario</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Propietario</div>
              </div>
              <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ borderBottom: '1px solid var(--text-main)', height: '40px', marginBottom: '8px' }}></div>
                <div style={{ fontSize: '12px', fontWeight: 600 }}>Ricardo Peña (Co-Anfitrión)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
              <button className="btn-outline"><Download size={18}/> Descargar PDF</button>
              <button className="btn-outline"><FileText size={18}/> Descargar Excel</button>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
              <button className="btn-primary" style={{ background: '#FC642D' }}><Plus size={18}/> Agregar Gasto</button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Fecha</th>
                  <th style={{ padding: '12px' }}>Descripción</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px' }}>{new Date(exp.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px' }}>{exp.description}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#FC642D' }}>-${exp.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
