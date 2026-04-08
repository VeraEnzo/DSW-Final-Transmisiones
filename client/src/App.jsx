import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cajas from './pages/Cajas';
import CajaNueva from './pages/CajaNueva';
import CajaDetalle from './pages/CajaDetalle';
import ReparacionNueva from './pages/ReparacionNueva';
import ReparacionDetalle from './pages/ReparacionDetalle';
import Clientes from './pages/Clientes';
import ClienteDetalle from './pages/ClienteDetalle';
import Usuarios from './pages/Usuarios';

function RequireAuth({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.rol !== 'admin') return <Navigate to="/" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/cajas" element={<RequireAuth><Cajas /></RequireAuth>} />
      <Route path="/cajas/nueva" element={<RequireAuth><CajaNueva /></RequireAuth>} />
      <Route path="/cajas/:id" element={<RequireAuth><CajaDetalle /></RequireAuth>} />
      <Route path="/cajas/:id/reparacion/nueva" element={<RequireAuth><ReparacionNueva /></RequireAuth>} />
      <Route path="/reparaciones/:id" element={<RequireAuth><ReparacionDetalle /></RequireAuth>} />
      <Route path="/clientes" element={<RequireAuth><Clientes /></RequireAuth>} />
      <Route path="/clientes/:id" element={<RequireAuth><ClienteDetalle /></RequireAuth>} />
      <Route path="/usuarios" element={<RequireAuth adminOnly><Usuarios /></RequireAuth>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
