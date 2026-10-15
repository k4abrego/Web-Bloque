// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/login/login";

import InicioAdmin from "./pages/admin/inicioAdmin";
import ReportesAdmin from "./pages/admin/reportesAdmin";
import FiltrosAdmin from "./pages/admin/filtrosAdmin";
import ArchivosAdmin from "./pages/admin/archivosAdmin";
import MapaCalorAdmin from "./pages/admin/mapaCalorAdmin";
import AlimentadoresAdmin from "./pages/admin/alimentadoresAdmin";
import ConfiguracionAdmin from "./pages/admin/configuracionAdmin";
import DetalleReporteAdmin from "./pages/admin/detalleReporteAdmin";

import InicioAlimentador from "./pages/alimentador/inicioAlim";
import ReportesAlim from "./pages/alimentador/reportesAlim";
import MapaAlim from "./pages/alimentador/mapaAlim";
import PerfilAlim from "./pages/alimentador/perfilAlim";
import ConfiguracionAlim from "./pages/alimentador/configuracionAlim";

import AlimLayout from "./layouts/alimLayout";
import DashboardLayout from "./layouts/dashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import ConnectionBanner from "./components/ConnectionBanner";

// Sección: App.
function App() {
  return (
    <>
      <ConnectionBanner />

      <BrowserRouter>
        <Routes>

          {/* Página de inicio de sesión */}
          <Route
            path="/"
            element={<Login />}
          />

          {/* ==================== ADMIN ==================== */}

          <Route element={<ProtectedRoute rolPermitido="admin" />}>
            <Route
              path="/admin"
              element={<DashboardLayout role="admin" />}
            >
              {/* Inicio */}
              <Route
                index
                element={<InicioAdmin />}
              />

              {/* Lista de reportes */}
              <Route
                path="reportes"
                element={<ReportesAdmin />}
              />

              {/* Detalle de reporte */}
              <Route
                path="reportes/:id"
                element={<DetalleReporteAdmin />}
              />

              {/* Filtros y etiquetas */}
              <Route
                path="filtros"
                element={<FiltrosAdmin />}
              />

              {/* Archivos */}
              <Route
                path="archivos"
                element={<ArchivosAdmin />}
              />

              {/* Mapa de calor */}
              <Route
                path="mapa-calor"
                element={<MapaCalorAdmin />}
              />

              {/* Cuentas de alimentadores */}
              <Route
                path="alimentadores"
                element={<AlimentadoresAdmin />}
              />

              {/* Configuración */}
              <Route
                path="configuracion"
                element={<ConfiguracionAdmin />}
              />
            </Route>
          </Route>

          {/* ==================== ALIMENTADOR ==================== */}

          <Route element={<ProtectedRoute rolPermitido="alimentador" />}>
            <Route
              path="/alimentador"
              element={<AlimLayout />}
            >
              {/* Inicio */}
              <Route
                index
                element={<InicioAlimentador />}
              />

              {/* Reportes */}
              <Route
                path="reportes"
                element={<ReportesAlim />}
              />

              {/* Mapa */}
              <Route
                path="mapa"
                element={<MapaAlim />}
              />

              {/* Configuración */}
              <Route
                path="configuracion"
                element={<ConfiguracionAlim />}
              />

              {/* Perfil */}
              <Route
                path="perfil"
                element={<PerfilAlim />}
              />
            </Route>
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;