import { Navigate, Outlet } from "react-router-dom";

/**
 * Protege las rutas según la sesión y el rol.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.rolPermitido - Rol necesario.
 */
function ProtectedRoute({ rolPermitido }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  // Si no hay sesión, regresar al login.
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Si el rol no coincide, impedir el acceso.
  if (rol !== rolPermitido) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
