import { useState } from 'react';
import { Plus, Package, Search, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../hooks/usePermissions';
import { usePagination } from '../hooks/usePagination';
import PaginationBar from '../components/PaginationBar';
import AddInventoryItemModal from '../components/AddInventoryItemModal';

const TH = {
  padding: '11px 16px',
  textAlign: 'left' as const,
  fontSize: '11px',
  fontWeight: 700,
  color: '#767676',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const TD = {
  padding: '13px 16px',
  verticalAlign: 'middle' as const,
  fontSize: '14px',
};

const pillStyle = (active: boolean, color: string) => ({
  padding: '6px 14px',
  borderRadius: '20px',
  border: `1.5px solid ${active ? color : '#e0e0e0'}`,
  background: active ? color : 'transparent',
  color: active ? 'white' : '#484848',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: active ? 600 : 400,
  fontFamily: 'inherit',
  transition: 'all 0.15s',
  lineHeight: '1.4',
});

const Inventario = () => {
  const {
    properties,
    inventoryCategories,
    inventoryItems,
    addInventoryItem,
    deleteInventoryItem,
  } = useApp();
  const { canCreate, canDelete, hasPropertyAccess } = usePermissions();

  const accessibleProperties = properties.filter(p => hasPropertyAccess(p.id));
  const [selectedPropertyId, setSelectedPropertyId] = useState(accessibleProperties[0]?.id ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [search, setSearch]           = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filtered = inventoryItems.filter(item => {
    if (selectedPropertyId && item.propertyId !== selectedPropertyId) return false;
    if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { page, setPage, pageSize, setPageSize, paginated, totalPages, totalItems, resetPage } =
    usePagination(filtered, 'inventario');

  const countForCat = (catId: string) =>
    inventoryItems.filter(i => i.propertyId === selectedPropertyId && i.categoryId === catId).length;

  const totalForProp = inventoryItems.filter(i => i.propertyId === selectedPropertyId).length;

  const handleCatSelect = (id: string) => {
    setSelectedCategoryId(id);
    resetPage();
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    resetPage();
  };

  const handlePropertyChange = (propId: string) => {
    setSelectedPropertyId(propId);
    setSelectedCategoryId('all');
    setSearch('');
    resetPage();
  };

  if (accessibleProperties.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h2 className="page-title">Inventario</h2>
        </div>
        <div className="property-card" style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ marginBottom: '16px', opacity: 0.25 }} />
          <p>Agrega propiedades primero para gestionar su inventario.</p>
        </div>
      </div>
    );
  }

  const selectedProp = properties.find(p => p.id === selectedPropertyId);

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h2 className="page-title">Inventario</h2>
        {canCreate('inventory') && (
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={20} /> Agregar Artículo
          </button>
        )}
      </div>

      <div className="property-card" style={{ padding: '24px' }}>

        {/* Filters row */}
        <div style={{
          display: 'flex', gap: '16px', marginBottom: '20px',
          flexWrap: 'wrap', alignItems: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Propiedad:
            </label>
            <select
              className="form-input"
              value={selectedPropertyId}
              onChange={e => handlePropertyChange(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {accessibleProperties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }}
            />
            <input
              className="form-input"
              placeholder="Buscar artículo..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              style={{ paddingLeft: '34px' }}
            />
          </div>
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={() => handleCatSelect('all')}
            style={pillStyle(selectedCategoryId === 'all', '#FF5A5F')}
          >
            📦 Todas ({totalForProp})
          </button>
          {inventoryCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCatSelect(cat.id)}
              style={pillStyle(selectedCategoryId === cat.id, cat.color)}
            >
              {cat.icon} {cat.name} ({countForCat(cat.id)})
            </button>
          ))}
        </div>

        {/* Sub-title */}
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {selectedProp?.name}
          {selectedCategoryId !== 'all' && ` · ${inventoryCategories.find(c => c.id === selectedCategoryId)?.name}`}
          {search && ` · Búsqueda: "${search}"`}
        </p>

        {/* Table */}
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7f7f7', borderBottom: '1px solid var(--border-color)' }}>
                <th style={TH}>Categoría</th>
                <th style={TH}>Artículo</th>
                <th style={{ ...TH, textAlign: 'center' }}>Cant.</th>
                <th style={TH}>Unidad</th>
                <th style={TH}>Notas</th>
                <th style={{ ...TH, width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Package size={48} style={{ opacity: 0.2 }} />
                      <span style={{ fontSize: '15px', maxWidth: '340px', lineHeight: 1.5 }}>
                        {search
                          ? `Sin resultados para "${search}"`
                          : selectedCategoryId === 'all'
                          ? 'Esta propiedad aún no tiene artículos. Usa el botón + Agregar Artículo.'
                          : `Sin artículos en esta categoría todavía.`}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map(item => {
                  const cat = inventoryCategories.find(c => c.id === item.categoryId);
                  return (
                    <tr
                      key={item.id}
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={TD}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '3px 10px', borderRadius: '12px',
                          background: cat ? `${cat.color}15` : '#f0f0f0',
                          color: cat?.color ?? '#767676',
                          fontSize: '12px', fontWeight: 600,
                        }}>
                          {cat?.icon} {cat?.name ?? '—'}
                        </span>
                      </td>
                      <td style={{ ...TD, fontWeight: 500 }}>{item.name}</td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-block', minWidth: '34px',
                          padding: '3px 10px', borderRadius: '8px',
                          background: 'rgba(0,166,153,0.12)',
                          color: 'var(--success)', fontWeight: 700, fontSize: '13px',
                        }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ ...TD, color: 'var(--text-muted)', fontSize: '13px' }}>
                        {item.unit ?? <span style={{ opacity: 0.35 }}>—</span>}
                      </td>
                      <td style={{ ...TD, color: 'var(--text-muted)', fontSize: '13px' }}>
                        {item.notes ?? <span style={{ opacity: 0.35 }}>—</span>}
                      </td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        {canDelete('inventory') && (
                        <button
                          title="Eliminar artículo"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar "${item.name}"?`)) {
                              deleteInventoryItem(item.id);
                            }
                          }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '6px', borderRadius: '6px',
                            color: 'var(--text-muted)', display: 'inline-flex',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#FF5A5F')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 size={16} />
                        </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationBar
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          setPage={setPage}
          setPageSize={setPageSize}
        />
      </div>

      {isAddModalOpen && (
        <AddInventoryItemModal
          properties={properties}
          categories={inventoryCategories}
          initialPropertyId={selectedPropertyId}
          onAdd={item => { addInventoryItem(item); setIsAddModalOpen(false); }}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Inventario;
