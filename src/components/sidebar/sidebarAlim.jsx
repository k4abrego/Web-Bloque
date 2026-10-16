import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
    Home,
    ClipboardList,
    Map,
    Settings,
    PanelLeftClose,
    User,
    PanelLeftOpen,
    LogOut,
    ChevronDown,
} from "lucide-react";

import logoSIPINNA from "../../assets/sipinnalogo.png";
import "./sidebarAlim.css";

/**
 * Componente de navegación lateral para usuarios con rol de Alimentador.
 *
 * Permite navegar entre las secciones principales del sistema SIPINNA,
 * expandir o contraer la barra lateral y visualizar un menú con
 * información del perfil y la opción de cerrar sesión.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {boolean} props.isOpen - Indica si la barra lateral está expandida.
 * @param {Function} props.onToggle - Función que alterna el estado de la barra lateral.
 * @returns {JSX.Element} Barra lateral de navegación del Alimentador.
 */

function SidebarAlim({ isOpen, onToggle }) {
// Sección: declaración.
    const [profileOpen, setProfileOpen] = useState(false);
    return(
        <aside
        className={`sidebar-alim ${isOpen ? "" : "collapsed"}`}
        >
            <div className="sidbar-arriba">
                <button className="boton-barra-lateral"
                onClick={onToggle}
                >
                    {
                        isOpen
                        ? <PanelLeftClose size= {20} />
                        : <PanelLeftOpen size={20}/>
                    }
                </button>
            </div>

            <nav className="sidebar-menu">
                <NavLink
                to="/alimentador"
                end
                className={({ isActive }) =>
                    isActive
                    ? "sidebar-item active"
                    : "sidebar-item"
                }
                >
                    <Home size={22}/>
                    <span className="sidebar-text">
                        Inicio
                    </span>
                </NavLink>

                <NavLink
                to="/alimentador/reportes"
                className={({isActive}) =>
                    isActive
                        ? "sidebar-item active"
                        : "sidebar-item"
                }
            >
                <ClipboardList size={22}/>
                <span className="sidebar-text">
                    Reportes
                </span>
            </NavLink>

            <NavLink
                to="/alimentador/mapa"
                className={({isActive}) =>
                    isActive
                        ? "sidebar-item active"
                        : "sidebar-item"
                }
            >
                <Map     size={22}/>
                <span className="sidebar-text">
                    Mapa
                </span>
            </NavLink>

            <NavLink
                to="/alimentador/configuracion"
                className={({isActive}) =>
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

            <div className="sidebar-footer">
                <div className="sidebar-brand">
                    <div className="sidebar-logo-container">
                        <img 
                        src={logoSIPINNA}
                        alt="lOGO sipinna"
                        className="sidebar-logo"
                        />
                    </div>
                </div>

                <div className="profile-wrapper">
                    {profileOpen && isOpen && (
                        <div className="profile-dropdown">
                            <span className="profile-name">
                                Alimentador
                            </span>

                            <span className="profile-email">
                                mail
                            </span>

                            <span className="profile-roel">
                                Rol: Alimentador
                            </span>

                            <span className="profile-institu">
                                Organzación: Organización
                            </span>

                            <div className="profile-divider">                            </div>

                            <NavLink
                                to="/"
                                className="profile-logout"
                            >
                                <LogOut size={18}/>
                                <span>
                                    Cerrar Sesión
                                </span>
                            </NavLink>
                        </div>
                    )}

                    <button
                    className="perfil"
                        onClick={() => {

                            if (!isOpen){
                                onToggle();
                                return;
                            }
                            setProfileOpen(!profileOpen);
                        }}
                        >
                            <User size={22}/>
                            <span className="sidebar-text">
                                    Alimentador
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
        </nav>
    </aside>
    );
}

export default SidebarAlim; 
