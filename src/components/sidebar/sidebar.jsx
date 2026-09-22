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
        <NavLink
          to="/admin"
          end
          className={({isActive}) =>
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

        <button
          className="sidebar-item"
          disabled
        >
          <ClipboardList size={22}/>
          <span className="sidebar-text">
            Lista de reportes
          </span>
        </button>

        <button
          className="sidebar-item"
          disabled
        >
          <Tags size={22}/>
          <span className="sidebar-text">
            Filtros y etiquetas
          </span>
        </button>

        <button
          className="sidebar-item"
          disabled
        >
          <FolderOpen size={22}/>
          <span className="sidebar-text">
            Archivos
          </span>
        </button>

        <button
          className="sidebar-item"
          disabled
        >
          <Archive size={22}/>
          <span className="sidebar-text">
            Archivados
          </span>
        </button>

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