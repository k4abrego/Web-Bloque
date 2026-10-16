// Imports
import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import logoSIPINNA from "../../assets/sipinnalogo.png";
import "./sidebar.css";
import sidebarConfig from "./sidebarConfig";
import { obtenerPermisos } from "../../services/permisos";


// Crea el menu lateral y decidee si se muestra abierto o cerrado
// Sección: Sidebar.
function Sidebar({ role, isOpen, onToggle }) {

  // Guarda la info del perfil
  // Sección: declaración.
    const [profileOpen, setProfileOpen] = useState(false);

  // Opciones del menu correspondiente al rol
  // Sección: menuItems.
    /**
   * Obtiene los permisos visuales del usuario autenticado.
   *
   * Permite distinguir entre administrador principal
   * y administrador normal.
   *
   * IMPORTANTE:
   * Esta validación es únicamente de interfaz.
   * La autorización real corresponde al backend.
   */
  const permisos = obtenerPermisos();

  /**
   * Obtiene las opciones correspondientes al rol y
   * oculta la gestión de administradores cuando
   * el usuario no tiene el permiso correspondiente.
   */
  const menuItems = (sidebarConfig[role] || []).filter((item) => {
    if (item.path === "/admin/administradores") {
      return permisos.puedeGestionarAdministradores;
    }

    return true;
  });

  return (
    <aside
      className={`admin-sidebar ${isOpen ? "" : "collapsed"}`}
    >
      {/* Botón superior */}
      <div className="sidebar-top">

        {/* Cambia el icono dependiendo si el sidebar esta abierto o cerrado */}
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

      {/* Menú principal */}
      <nav className="sidebar-menu">

        {menuItems.map((item, index) => {

          /* Muestra los títulos de cada sección del menú */
          if (item.section) {
            return (
              <span
                key={`section-${index}`}
                className="sidebar-section-title"
              >
                {item.section}
              </span>
            );
          }

          /* Obtiene el icono correspondiente a cada opción */
// Sección: Icon.
          const Icon = item.icon;

          /* Crea cada opción del menú según el rol */
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === `/${role}`}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-item active"
                  : "sidebar-item"
              }
            >

              <Icon size={22}/>

              <span className="sidebar-text">
                {item.label}
              </span>

            </NavLink>
          );

        })}

      </nav>


      {/* Parte inferiro del sidebar*/}
      <div className="sidebar-footer">

        {/* Logo de sipinna */}
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

              {/* Separa la info de la opcion de cerrar sesion*/}
              <div className="profile-divider"></div>

              {/* Cerrar sesión */}
              <NavLink
                to="/"
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

              // Si el sidebar está cerrado, primero lo abre 
              if (!isOpen) {
                onToggle();
                return;
              }

              // Si está abierto, muestra u oculta la información 
              setProfileOpen(!profileOpen);
            }}
          >

            <User size={22}/>

            <span className="sidebar-text">
              Administrador
            </span>


            {/* La flecha gira dependiendo si se abre o se cierra */}
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

// Permite utilizar sidebar en otras partes de la app
export default Sidebar;