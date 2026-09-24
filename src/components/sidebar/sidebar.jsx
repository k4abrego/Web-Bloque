import { NavLink } from "react-router-dom";

import {
  House,
  ClipboardList,
  Tags,
  FolderOpen,
  Archive,
  PanelLeftClose,
  PanelLeftOpen,
  User
} from "lucide-react";

import logoSIPINNA from "../../assets/sipinnalogo.png";
import "./sidebar.css";


function Sidebar({ isOpen, onToggle }) {

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "" : "collapsed"}`}
    >
      {/* =========================
          BOTÓN SUPERIOR
          ========================= */}

      <div className="sidebar-top">

        <button
          className="sidebar-toggle-inside"
          onClick={onToggle}
        >
          {
            isOpen
              ? <PanelLeftClose size={20}/>
              : <PanelLeftOpen size={20}/>
          }

        </button>
      </div>

      {/* =========================
          MENÚ PRINCIPAL
          ========================= */}

      <nav className="sidebar-menu">

        {/* Inicio */}
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <House size={22}/>

          <span className="sidebar-text">
            Inicio
          </span>
        </NavLink>


        {/* Lista de reportes */}
        <NavLink
          to="/admin/reportes"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <ClipboardList size={22}/>

          <span className="sidebar-text">
            Lista de reportes
          </span>
        </NavLink>


        {/* Filtros y etiquetas */}
        <NavLink
          to="/admin/filtros"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <Tags size={22}/>

          <span className="sidebar-text">
            Filtros y etiquetas
          </span>
        </NavLink>


        {/* Archivos */}
        <NavLink
          to="/admin/archivos"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <FolderOpen size={22}/>

          <span className="sidebar-text">
            Archivos
          </span>
        </NavLink>


        {/* Archivados */}
        <NavLink
          to="/admin/archivados"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <Archive size={22}/>

          <span className="sidebar-text">
            Archivados
          </span>
        </NavLink>

      </nav>


      {/* =========================
          PARTE INFERIOR
          LOGO + PERFIL
          ========================= */}


      <div className="sidebar-footer">

        <div className="sidebar-brand">

          <div className="sidebar-logo-container">
            <img
              src={logoSIPINNA}
              alt="Logo SIPINNA"
              className="sidebar-logo"
            />
          </div>

          {/* <p className="sidebar-subtitle">
            Panel de Administrador
          </p> */}

        </div>



        <div className="profile">
          <User size={22}/>
          <span className="sidebar-text">
            Administrador
          </span>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;