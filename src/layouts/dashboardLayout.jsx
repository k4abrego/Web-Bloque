import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/sidebar";
import "./dashboardLayout.css";


/* Layout reutilizable para los paneles de Administrador y Alimentador */
function DashboardLayout({ role }) {

  /* Guarda si el menú lateral está abierto o cerrado */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="dashboard-layout">


      {/* Muestra el menú lateral correspondiente al rol */}
      <Sidebar
        role={role}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />


      {/* Aquí se muestra la página seleccionada desde el menú */}
      <main className="dashboard-content">
        <Outlet />
      </main>


    </div>
  );
}


/* Permite reutilizar este layout en diferentes tipos de usuario */
export default DashboardLayout;