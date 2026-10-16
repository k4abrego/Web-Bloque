
import { useNavigate } from "react-router-dom";
import { cerrarSesion } from "../../services/authApi";

function InicioReportante() {
  const navigate = useNavigate();

  const handleLogout = () => {
    cerrarSesion();
    navigate("/", { replace: true });
  };

  return (
    <main style={{
      maxWidth: "800px",
      margin: "80px auto",
      padding: "30px",
      textAlign: "center"
    }}>
      <h1>Panel de reportante</h1>

      <p>
        Bienvenido al sistema SIPINNA.
      </p>

      <p>
        Has iniciado sesión como reportante.
      </p>

      <p>
        Este módulo se encuentra en desarrollo.
      </p>

      <button onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  );
}

export default InicioReportante;
