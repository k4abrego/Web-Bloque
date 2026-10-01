import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  House,
  ClipboardList,
  Tags,
  FolderOpen,
  Map,
  Users,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

import logoSIPINNA from "../../assets/sipinnalogo.png";
import "./sidebar.css";


function Sidebar({ isOpen, onToggle }) {

  const [profileOpen, setProfileOpen] = useState(false);

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


        {/* =========================
            SECCIÓN REPORTES
            ========================= */}

        <span className="sidebar-section-title">
          REPORTES
        </span>


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


        {/* Mapa de calor */}
        <NavLink
          to="/admin/mapa-calor"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <Map size={22}/>
          <span className="sidebar-text">
            Mapa de calor
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


        {/* =========================
            SECCIÓN ADMINISTRACIÓN
            ========================= */}

        <span className="sidebar-section-title">
          ADMINISTRACIÓN
        </span>


        {/* Cuentas de alimentadores */}
        <NavLink
          to="/admin/alimentadores"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <Users size={22}/>
          <span className="sidebar-text">
            Cuentas de alimentadores
          </span>
        </NavLink>


        {/* Configuración */}
        <NavLink
          to="/admin/configuracion"
          className={({ isActive }) =>
            isActive
              ? "sidebar-item active"
              : "sidebar-item"
          }
        >
          <Settings size={22}/>
          <span className="sidebar-text">
            Configuración
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



        {/* Perfil del administrador */}
        <div className="profile-wrapper">

          {/* Información desplegable */}
          {profileOpen && isOpen && (
            <div className="profile-dropdown">

              <span className="profile-name">
                Administrador SIPINNA
              </span>

              <span className="profile-email">
                admin@sipinna.mx
              </span>

              <span className="profile-role">
                Rol: Administrador
              </span>

              {/* Separador */}
              <div className="profile-divider"></div>

              {/* Cerrar sesión */}
              <NavLink
                to="/login"
                className="profile-logout"
              >
                <LogOut size={18}/>

                <span>
                  Cerrar sesión
                </span>
              </NavLink>

            </div>
          )}


          {/* Botón de perfil */}
          <button
            className="profile"
            onClick={() => {

              /* Si el sidebar está cerrado, primero lo abre */
              if (!isOpen) {
                onToggle();
                return;
              }

              /* Si está abierto, muestra u oculta la información */
              setProfileOpen(!profileOpen);
            }}
          >

            <User size={22}/>

            <span className="sidebar-text">
              Administrador
            </span>

            <ChevronDown
              size={18}
              className={`profile-arrow ${
                profileOpen ? "open" : ""
              }`}
            />

          </button>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;