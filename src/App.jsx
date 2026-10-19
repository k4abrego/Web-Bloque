/**
 * App.jsx
 *
 * Define las rutas principales del sistema SIPINNA
 * y organiza las vistas según el rol del usuario.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";

// Página de inicio de sesión.
import Login from "./pages/login/login";

// Páginas del administrador.
import InicioAdmin from "./pages/admin/inicioAdmin";
import ReportesAdmin from "./pages/admin/reportesAdmin";
import FiltrosAdmin from "./pages/admin/filtrosAdmin";
import ArchivosAdmin from "./pages/admin/archivosAdmin";
import MapaCalorAdmin from "./pages/admin/mapaCalorAdmin";
import AlimentadoresAdmin from "./pages/admin/alimentadoresAdmin";
import ConfiguracionAdmin from "./pages/admin/configuracionAdmin";
import DetalleReporteAdmin from "./pages/admin/detalleReporteAdmin";

// Nueva página de gestión de administradores.
import AdministradoresAdmin from "./pages/admin/administradoresAdmin";

// Páginas del alimentador.
import InicioAlimentador from "./pages/alimentador/inicioAlim";
import ReportesAlim from "./pages/alimentador/reportesAlim";
import MapaAlim from "./pages/alimentador/mapaAlim";
import PerfilAlim from "./pages/alimentador/perfilAlim";
import ConfiguracionAlim from "./pages/alimentador/configuracionAlim";
import DetalleReporteAlim from "./pages/alimentador/detalleReporteAlim";

// Página del reportante.
import InicioReportante from "./pages/reportante/inicioReportante";

// Layouts compartidos.
import AlimLayout from "./layouts/alimLayout";
import DashboardLayout from "./layouts/dashboardLayout";

// Componentes de protección y conexión.
import ProtectedRoute from "./components/ProtectedRoute";
import ConnectionBanner from "./components/ConnectionBanner";


/**
 * Vista de administración de usuarios registrados
 * desde la aplicación móvil.
 */
import UsuariosAppAdmin from "./pages/admin/usuariosAppAdmin";

/**
 * Protección de rutas exclusivas para
 * el administrador principal.
 */
import PrincipalRoute from "./components/principalRoute";


/**
 * App
 *
 * Configura la navegación principal del sistema.
 * Cada grupo de rutas utiliza el componente de
 * protección correspondiente a su rol.
 *
 * @returns {JSX.Element} Enrutador de la aplicación.
 */
function App() {
  return (
    <>
      <ConnectionBanner />

      <BrowserRouter>
        <Routes>

          {/* Inicio de sesión */}
          <Route path="/" element={<Login />} />

          {/* Rutas del administrador */}
          <Route
            element={<ProtectedRoute rolPermitido="admin" />}
          >
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
              <Route element={<PrincipalRoute />}>
                <Route
                  path="administradores"
                  element={<AdministradoresAdmin />}
                />
              </Route>

              <Route element={<PrincipalRoute />}>

              <Route
                path="administradores"
                element={<AdministradoresAdmin />}
              />

              <Route
                path="usuarios-app"
                element={<UsuariosAppAdmin />}
              />
            </Route>


              <Route
                path="configuracion"
                element={<ConfiguracionAdmin />}
              />

            </Route>
          </Route>

          {/* Rutas del alimentador */}
          <Route
            element={<ProtectedRoute rolPermitido="alimentador" />}
          >
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
                path="reportes/:folio"
                element={<DetalleReporteAlim />}
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
          </Route>

          {/* Ruta del reportante */}
          <Route
            element={<ProtectedRoute rolPermitido="reportante" />}
          >
            <Route
              path="/reportante"
              element={<InicioReportante />}
            />
          </Route>

          {/* Ruta de respaldo */}
          <Route
            path="*"
            element={<Login />}
          />

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
