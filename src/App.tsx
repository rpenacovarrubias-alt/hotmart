import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DeleteModal from './components/DeleteModal';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Reports from './pages/Reports';
import Team from './pages/Team';
import ControlAdministrativo from './pages/ControlAdministrativo';

const AppContent = () => {
  const { deleteModalOpen } = useApp();

  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/propiedades/:id" element={<PropertyDetail />} />
            <Route path="/tareas" element={<Tasks />} />
            <Route path="/finanzas" element={<Finances />} />
            <Route path="/inventario" element={<div>Módulo de Inventario en construcción...</div>} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/usuarios" element={<Team />} />
            <Route path="/control-administrativo" element={<ControlAdministrativo />} />
          </Routes>
        </main>
      </div>
      {deleteModalOpen && <DeleteModal />}
    </BrowserRouter>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
