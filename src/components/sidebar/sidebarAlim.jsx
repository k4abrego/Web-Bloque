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

function SidebarAlim({ isOpen, onToggle }) {
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
                    ? "sidebar active"
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
                        ? "sidebar active"
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
                        ? "sidebar active"
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
                        ? "sidebar active"
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
                                to="/login"
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
