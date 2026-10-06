// Iconos utilizados en las opciones de los diferentes menús 
import {
  House,
  ClipboardList,
  Tags,
  FolderOpen,
  Map,
  Users,
  Settings,
  Clock,
  CircleDot,
} from "lucide-react";


// Opciones del sidebar que corresponden a cada tipo de usuario 
const sidebarConfig = {

//   --- Administrador --- 

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

    {
      label: "Configuración",
      path: "/admin/configuracion",
      icon: Settings,
    },
  ],


//  --- Alimentador ---

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


// Permite utilizar esta configuración desde el Sidebar
export default sidebarConfig;