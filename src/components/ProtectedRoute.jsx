import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ rolPermitido }) {
  const token = localStorage.getItem("token");
  const rol = localStorage.getItem("rol");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (
    rol?.toLowerCase() !== rolPermitido?.toLowerCase()
  ) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;