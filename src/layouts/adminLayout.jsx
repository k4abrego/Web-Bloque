import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/sidebar/sidebar";

import "./adminLayout.css";

function AdminLayout() {
  // Controla si el sidebar está abierto o colapsado
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="admin-layout">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;