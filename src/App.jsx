// Imports
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "./layouts/dashboardLayout";
import Login from "./pages/login/login";
import InicioAdmin from "./pages/admin/inicioAdmin";
import InicioAlimentador from "./pages/alimentador/inicioAlim";
import ReportesAdmin from "./pages/admin/reportesAdmin";
import FiltrosAdmin from "./pages/admin/filtrosAdmin";
import ArchivosAdmin from "./pages/admin/archivosAdmin";
import MapaCalorAdmin from "./pages/admin/mapaCalorAdmin";
import AlimentadoresAdmin from "./pages/admin/alimentadoresAdmin";
<<<<<<< HEAD
import ConfiguracionAdmin from "./pages/admin/configuracionAdmin";  
import AlimLayout from "./layouts/alimLayout";
import ReportesAlim from "./pages/alimentador/reportesAlim";
import MapaAlim from "./pages/alimentador/mapaAlim";
import PerfilAlim from "./pages/alimentador/perfilAlim";
import ConfiguracionAlim from "./pages/alimentador/configuracionAlim";

=======
import ConfiguracionAdmin from "./pages/admin/configuracionAdmin";
import DashboardLayout from "./layouts/dashboardLayout";
import DetalleReporteAdmin from "./pages/admin/detalleReporteAdmin";
>>>>>>> origin/main

function App() {

  return (
    
    <BrowserRouter>
      <Routes>
        {/* Página de inicio de sesión */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* Panel de administrador */}
        <Route
          path="/admin"
          element={<DashboardLayout role = "admin"/>}
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

          <Route
            path="reportes/:id"
            element = {<DetalleReporteAdmin/>}
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


        {/* Panel Alimentador */}
<<<<<<< HEAD
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
=======
        <Route
          path="/alimentador"
          element={<DashboardLayout role = "alimentador" />}
        >
          <Route index element = {<InicioAlimentador />} />
        </Route>
      
>>>>>>> origin/main

      </Routes>
    </BrowserRouter>

  );

}

export default App;