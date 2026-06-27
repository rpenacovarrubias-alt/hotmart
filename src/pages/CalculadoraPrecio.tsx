const CalculadoraPrecio = () => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#fbf9f8' }}>
      <iframe
        src="/hospitalidad-digital.html"
        title="Calculadora de Precio Dinámico — Hospitalidad Digital"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        allow="clipboard-write"
      />
    </div>
  );
};

export default CalculadoraPrecio;
