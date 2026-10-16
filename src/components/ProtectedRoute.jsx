import { Navigate, Outlet } from "react-router-dom";
import { normalizarRol } from "../services/roles";

function ProtectedRoute({ rolPermitido }) {
  const token = localStorage.getItem("token");
  const rol = normalizarRol(localStorage.getItem("rol"));

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (rol !== normalizarRol(rolPermitido)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
