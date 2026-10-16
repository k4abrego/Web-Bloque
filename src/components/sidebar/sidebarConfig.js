  /**
 * Configuración de navegación del sistema SIPINNA.
 *
 * Define las opciones del menú lateral de acuerdo con
 * el rol del usuario autenticado.
 *
 * IMPORTANTE:
 * Esta configuración controla únicamente la navegación.
 * Los permisos reales deben validarse en el backend.
 */

import {
  House,
  ClipboardList,
  Tags,
  FolderOpen,
  Map,
  Users,
  UserCog,
  Settings,
  Clock,
  CircleDot,
} from "lucide-react";

/**
 * Menús disponibles para cada rol.
 *
 * admin: opciones del panel administrativo.
 * alimentador: opciones del panel de alimentadores.
 *
 * @type {Object<string, Array>}
 */
const sidebarConfig = {

  // Menú del administrador.
  admin: [
    {
      label: "Inicio",
      path: "/admin",
      icon: House,
    },

    {
      section: "REPORTES",
    },

    {
      label: "Lista de reportes",
      path: "/admin/reportes",
      icon: ClipboardList,
    },

    {
      label: "Mapa de calor",
      path: "/admin/mapa-calor",
      icon: Map,
    },

    {
      label: "Filtros y etiquetas",
      path: "/admin/filtros",
      icon: Tags,
    },

    {
      label: "Archivos",
      path: "/admin/archivos",
      icon: FolderOpen,
    },

    {
      section: "ADMINISTRACIÓN",
    },

    {
      label: "Cuentas de alimentadores",
      path: "/admin/alimentadores",
      icon: Users,
    },

    /**
     * Opción de gestión de administradores.
     *
     * Temporalmente aparece para el rol admin.
     * Posteriormente se restringirá al administrador
     * principal mediante permisos del backend.
     */
    {
      label: "Cuentas de administradores",
      path: "/admin/administradores",
      icon: UserCog,
    },

    {
      label: "Configuración",
      path: "/admin/configuracion",
      icon: Settings,
    },
  ],

  // Menú del alimentador.
  alimentador: [
    {
      label: "Inicio",
      path: "/alimentador",
      icon: House,
    },

    {
      section: "REPORTES",
    },

    {
      label: "Pendientes",
      path: "/alimentador/pendientes",
      icon: Clock,
    },

    {
      label: "En proceso",
      path: "/alimentador/en-proceso",
      icon: CircleDot,
    },

    {
      label: "Filtros y etiquetas",
      path: "/alimentador/filtros",
      icon: Tags,
    },
  ],
};

export default sidebarConfig;
