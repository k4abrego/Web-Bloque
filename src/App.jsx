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

// import ProtectedRoute from "./components/ProtectedRoute";
import ConnectionBanner from "./components/ConnectionBanner";

// Sección: App.
function App() {
  return (
    <>
      <ConnectionBanner />

      <BrowserRouter>
        <Routes>

          <Route
            path="/"
            element={<Login />}
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={<DashboardLayout role="admin" />}
          >
            <Route
              index
              element={<InicioAdmin />}
            />

            <Route
              path="reportes"
              element={<ReportesAdmin />}
            />

            <Route
              path="reportes/:id"
              element={<DetalleReporteAdmin />}
            />

            <Route
              path="filtros"
              element={<FiltrosAdmin />}
            />

            <Route
              path="archivos"
              element={<ArchivosAdmin />}
            />

            <Route
              path="mapa-calor"
              element={<MapaCalorAdmin />}
            />

            <Route
              path="alimentadores"
              element={<AlimentadoresAdmin />}
            />

            <Route
              path="configuracion"
              element={<ConfiguracionAdmin />}
            />
          </Route>


          {/* ALIMENTADOR */}
          <Route
            path="/alimentador"
            element={<AlimLayout />}
          >
            <Route
              index
              element={<InicioAlimentador />}
            />

            <Route
              path="reportes"
              element={<ReportesAlim />}
            />

            <Route
              path="mapa"
              element={<MapaAlim />}
            />

            <Route
              path="configuracion"
              element={<ConfiguracionAlim />}
            />

            <Route
              path="perfil"
              element={<PerfilAlim />}
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;