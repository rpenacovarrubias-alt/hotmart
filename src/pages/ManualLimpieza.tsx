const ManualLimpieza = () => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#fff' }}>
    <iframe
      src="/manual-limpieza.html"
      title="Manual de Limpieza Profesional — Hospitalidad Digital"
      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
      allow="clipboard-write"
    />
  </div>
);

export default ManualLimpieza;
