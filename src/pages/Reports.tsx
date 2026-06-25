import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, FileText, BarChart2 } from 'lucide-react';
import { mockProperties, mockIncomes, mockExpenses, mockTasks } from '../data/mockData';
import FinancialControl from '../components/FinancialControl';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';

const Reports = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState('all');

  // Simulated logged-in user role (toggle to test)
  const [simulatedRole, setSimulatedRole] = useState<'admin'|'host'>('admin');
  const [hostPropertyId] = useState('1'); // Simulated property ID for host

  const exportButtons = (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}><Download size={16}/> PDF</button>
      <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}><FileText size={16}/> Excel</button>
    </div>
  );

  // Reporte 1: Ingresos Mensuales por Propiedad
  const rep1Data = [
    { name: 'Semana 1', brutos: 4000, comision: 600, neto: 3400 },
    { name: 'Semana 2', brutos: 3000, comision: 450, neto: 2550 },
    { name: 'Semana 3', brutos: 5000, comision: 750, neto: 4250 },
    { name: 'Semana 4', brutos: 2000, comision: 300, neto: 1700 },
  ];

  // Reporte 2: Gastos por Categoría
  const expCatData = mockExpenses.reduce((acc, curr) => {
    if (selectedProperty !== 'all' && curr.propertyId !== selectedProperty) return acc;
    const existing = acc.find(x => x.name === curr.category);
    if (existing) existing.value += curr.amount;
    else acc.push({ name: curr.category, value: curr.amount });
    return acc;
  }, [] as any[]);
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#FF5A5F'];

  // Reporte 3: Tareas Pendientes
  const pendingTasks = mockTasks.filter(t => t.status !== 'Completado');
  const taskPag  = usePagination(pendingTasks, 'reports_tasks');
  const rep3Data = mockProperties.map(p => ({
    name: p.name,
    pendientes: pendingTasks.filter(t => t.propertyId === p.id).length
  })).filter(x => x.pendientes > 0);

  // Reporte 4: Ingresos Lineales
  const rep4Data = mockIncomes.filter(i => selectedProperty === 'all' || i.propertyId === selectedProperty)
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(i => ({ date: i.date, ingresos: i.grossIncome }));

  // Reporte 5: Apiladas
  const rep5Data = [
    { date: '2026-05-01', Prop1: 1200, Prop2: 800, Prop3: 0 },
    { date: '2026-05-02', Prop1: 0, Prop2: 800, Prop3: 950 },
    { date: '2026-05-03', Prop1: 1200, Prop2: 0, Prop3: 950 },
  ]; // Mocked directly for the example to show stacked

  if (simulatedRole === 'host') {
    return (
      <div>
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <h2 className="page-title">Mi Reporte de Propiedad</h2>
          <button className="btn-outline" onClick={() => setSimulatedRole('admin')} style={{fontSize: '12px'}}>Cambiar a Vista Admin</button>
        </div>
        <FinancialControl propertyId={hostPropertyId} />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2 className="page-title">Centro de Reportes</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {exportButtons}
          <button
            className="btn-primary"
            onClick={() => navigate('/reportes/constructor')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <BarChart2 size={16} /> Construir Reporte
          </button>
          <button className="btn-outline" onClick={() => setSimulatedRole('host')} style={{fontSize: '12px', marginLeft: '12px'}}>Ver como Anfitrión</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
        {[1,2,3,4,5].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: '10px 16px', 
              border: 'none', 
              background: activeTab === tab ? 'var(--primary)' : 'var(--surface-color)',
              color: activeTab === tab ? 'white' : 'var(--text-main)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab ? 'var(--shadow-md)' : 'none'
            }}
          >
            Reporte {tab}
          </button>
        ))}
      </div>

      <div className="property-card" style={{ padding: '24px' }}>
        {activeTab === 1 && (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>1. Ingresos Mensuales por Propiedad</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <select className="form-input" style={{ width: 'auto' }} value={selectedProperty} onChange={e=>setSelectedProperty(e.target.value)}>
                <option value="all">Todas las Propiedades</option>
                {mockProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="month" className="form-input" style={{ width: 'auto' }} />
            </div>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rep1Data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="brutos" name="Ingresos Brutos" fill="#00A699" />
                  <Bar dataKey="comision" name="Comisión Coanfitrión" fill="#FF5A5F" />
                  <Bar dataKey="neto" name="Neto Propietario" fill="#222222" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>2. Reporte de Gastos</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <input type="date" className="form-input" style={{ width: 'auto' }} />
              <input type="date" className="form-input" style={{ width: 'auto' }} />
              <select className="form-input" style={{ width: 'auto' }} value={selectedProperty} onChange={e=>setSelectedProperty(e.target.value)}>
                <option value="all">Todas las Propiedades</option>
                {mockProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expCatData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value" label>
                    {expCatData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 3 && (
          <div>
            <h3 style={{ marginBottom: '24px', fontSize: '18px' }}>3. Tareas Pendientes al Día de Hoy</h3>
            <div style={{ height: 350, marginBottom: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rep3Data} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="pendientes" fill="#FC642D" name="Tareas Pendientes" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-color)', color: 'var(--text-muted)' }}><th style={{padding:'12px'}}>Propiedad</th><th style={{padding:'12px'}}>Tarea</th><th style={{padding:'12px'}}>Responsable</th><th style={{padding:'12px'}}>Fecha</th></tr>
              </thead>
              <tbody>
                {taskPag.paginated.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{padding:'12px'}}>{mockProperties.find(p => p.id === t.propertyId)?.name}</td>
                    <td style={{padding:'12px'}}>{t.title}</td>
                    <td style={{padding:'12px'}}>{t.assignedTo}</td>
                    <td style={{padding:'12px'}}>{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <PaginationBar {...taskPag} />
          </div>
        )}

        {activeTab === 4 && (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>4. Ingresos por Rango de Fechas (Por Propiedad)</h3>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <select className="form-input" style={{ width: 'auto' }} value={selectedProperty} onChange={e=>setSelectedProperty(e.target.value)}>
                <option value="all">Selecciona una Propiedad</option>
                {mockProperties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rep4Data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="ingresos" stroke="#00A699" activeDot={{ r: 8 }} name="Ingresos ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 5 && (
          <div>
            <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>5. Ingresos Generales (Apilados)</h3>
            <div style={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rep5Data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Prop1" stackId="a" fill="#FF5A5F" />
                  <Bar dataKey="Prop2" stackId="a" fill="#00A699" />
                  <Bar dataKey="Prop3" stackId="a" fill="#FC642D" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
