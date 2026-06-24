import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import DeleteModal from './components/DeleteModal';
import EditModal from './components/EditModal';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyEdit from './pages/PropertyEdit';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Reports from './pages/Reports';
import Team from './pages/Team';
import ControlAdministrativo from './pages/ControlAdministrativo';

import PropertyGuide from './pages/PropertyGuide';
import GuideBuilderDashboard from './pages/GuideBuilderDashboard';
import GuideBuilder from './pages/GuideBuilder';
import GuidePdfView from './pages/GuidePdfView';
import GuideInteractiveView from './pages/GuideInteractiveView';
import AdminFooter from './components/AdminFooter';

const AppContent = () => {
  const { deleteModalOpen, editModalOpen } = useApp();

  return (
    <BrowserRouter>
      <Routes>
        {/* Vista interactiva del huésped (sin barra lateral ni envoltorio de admin) */}
        <Route path="/guia/:id" element={<GuideInteractiveView />} />
        <Route path="/guias/:id/interactiva" element={<GuideInteractiveView />} />
        
        {/* Vista PDF imprimible (limpia, sin barra lateral) */}
        <Route path="/guias/:id/pdf" element={<GuidePdfView />} />

        {/* Shell Administrativo para el resto de las páginas */}
        <Route path="/*" element={
          <div className="app-container">
            <Sidebar />
            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <div style={{ flex: 1 }}>
                <Routes>
                  <Route path="/"                         element={<Dashboard />} />
                  <Route path="/propiedades"              element={<Properties />} />
                  <Route path="/propiedades/:id"          element={<PropertyDetail />} />
                  <Route path="/propiedades/:id/editar"   element={<PropertyEdit />} />
                  <Route path="/propiedades/:id/guia"     element={<PropertyGuide />} />
                  <Route path="/guias"                    element={<GuideBuilderDashboard />} />
                  <Route path="/guias/nueva"              element={<GuideBuilder />} />
                  <Route path="/guias/:id/editar"         element={<GuideBuilder />} />
                  <Route path="/tareas"                   element={<Tasks />} />
                  <Route path="/finanzas"                 element={<Finances />} />
                  <Route path="/inventario"               element={<div>Módulo de Inventario en construcción...</div>} />
                  <Route path="/reportes"                 element={<Reports />} />
                  <Route path="/usuarios"                 element={<Team />} />
                  <Route path="/control-administrativo"   element={<ControlAdministrativo />} />
                </Routes>
              </div>
              <AdminFooter />
            </main>
          </div>
        } />
      </Routes>
      
      {deleteModalOpen && <DeleteModal />}
      {editModalOpen   && <EditModal />}
      <Toast />
      <Toaster richColors position="top-right" />
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

