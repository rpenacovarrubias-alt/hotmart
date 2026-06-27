import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import DeleteModal from './components/DeleteModal';
import EditModal from './components/EditModal';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyEdit from './pages/PropertyEdit';
import Tasks from './pages/Tasks';
import Finances from './pages/Finances';
import Reports from './pages/Reports';
import ReportBuilder from './pages/ReportBuilder';
import Team from './pages/Team';
import ControlAdministrativo from './pages/ControlAdministrativo';
import Inventario from './pages/Inventario';
import GuideBuilderDashboard from './pages/GuideBuilderDashboard';
import GuideBuilder from './pages/GuideBuilder';
import GuidePdfView from './pages/GuidePdfView';
import GuideInteractiveView from './pages/GuideInteractiveView';
import LandingPage from './pages/LandingPage';
import AnfitrionesCursosPage from './pages/AnfitrionesCursosPage';
import CalculadoraPrecio from './pages/CalculadoraPrecio';

// Authenticated section — only renders when logged in
const AuthenticatedApp = () => {
  const { deleteModalOpen, editModalOpen } = useApp();

  return (
    <>
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"                         element={<Dashboard />} />
            <Route path="/propiedades"              element={<Properties />} />
            <Route path="/propiedades/:id"          element={<PropertyDetail />} />
            <Route path="/propiedades/:id/editar"   element={<PropertyEdit />} />
            <Route path="/tareas"                   element={<Tasks />} />
            <Route path="/finanzas"                 element={<Finances />} />
            <Route path="/inventario"               element={<Inventario />} />
            <Route path="/reportes"                 element={<Reports />} />
            <Route path="/reportes/constructor"     element={<ReportBuilder />} />
            <Route path="/usuarios"                 element={<Team />} />
            <Route path="/control-administrativo"   element={<ControlAdministrativo />} />
            <Route path="/guias"                    element={<GuideBuilderDashboard />} />
            <Route path="/guias/nueva"              element={<GuideBuilder />} />
            <Route path="/guias/:id/editar"         element={<GuideBuilder />} />
          </Routes>
        </main>
      </div>
      {deleteModalOpen && <DeleteModal />}
      {editModalOpen   && <EditModal />}
      <Toast />
    </>
  );
};

// Top-level router — /landing is always public; everything else requires auth
const AppContent = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Public pages — no auth required */}
      <Route path="/landing"                    element={<LandingPage />} />
      <Route path="/calculadora-precio"         element={<CalculadoraPrecio />} />
      <Route path="/anfitriones"                element={<AnfitrionesCursosPage />} />
      <Route path="/guia/:id"                   element={<GuideInteractiveView />} />
      <Route path="/guias/:id/interactiva"      element={<GuideInteractiveView />} />
      <Route path="/guias/:id/pdf"              element={<GuidePdfView />} />

      {/* Auth-gated routes */}
      <Route
        path="/*"
        element={
          !currentUser
            ? <Login />
            : <AuthenticatedApp />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
