
import { Navigate, Outlet } from "react-router-dom";
import { obtenerPermisos } from "../services/permisos";

/**
 * PrincipalRoute
 *
 * Protege las rutas destinadas exclusivamente
 * al administrador principal.
 *
 * Verifica que el usuario tenga una sesión
 * y el permiso visual correspondiente.
 *
 * IMPORTANTE:
 * Esta protección funciona únicamente en React.
 * El backend también deberá validar los permisos
 * antes de permitir operaciones administrativas.
 *
 * @returns {JSX.Element} Ruta protegida o redirección.
 */
function PrincipalRoute() {
  const token = localStorage.getItem("token");
  const permisos = obtenerPermisos();

  // Evita el acceso cuando no existe una sesión.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Impide el acceso visual a administradores normales.
  if (!permisos.puedeGestionarAdministradores) {
    return <Navigate to="/admin" replace />;
  }

  // Permite mostrar la ruta autorizada.
  return <Outlet />;
}

export default PrincipalRoute;
