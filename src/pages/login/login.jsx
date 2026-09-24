import { ShieldCheck, Eye, EyeOff } from "lucide-react"
import { useState } from "react";
import "./login.css";
import logoSIPINNA from "../../assets/sipinnalogo.png"

function Login() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("admin");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const handleSubmit = (e) => {
      e.preventDefault();

      // Pendiente: conectar con Auth API.
      // El backend validará las credenciales y el rol.
};
    // Después aquí se coencta el backend
  };

  return (
    <div className="login-page">

      <div className="login-side">
        <div className="login-brand">
          <img
            src={logoSIPINNA}
            alt="Logo SIPINNA"
            className="sipinna-logo"
            />

          <h2>
            texto explicativo
            <br />
            si
          </h2>
        </div>
      </div>

      <div className="login-main">

        <div className="login-card">

          <div className="login-icon">
            <ShieldCheck size={42} />
          </div>

          <h1>Inicio de sesión</h1>

          <p className="login-description">
            Sistema de administración de reportes
          </p>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label htmlFor="correo">
                Correo electrónico
              </label>

              <input
                id="correo"
                type="email"
                placeholder="correo@sipinna.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasena">
                Contraseña
              </label>

              <div className="password-input-container">
            

              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <button
              type="button"
                className="password-toggle"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                aria-label={
                    mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
            >
                {mostrarContrasena ? (
                    <EyeOff size ={19} />
                ): (
                    <Eye size={19} />
                )}

            </button>
            </div>
            </div>

            <div className="forgot-password">
              <button type="button">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button
              className="login-button"
              type="submit"
            >
              Iniciar sesión
            </button>

            <div className="role-selector">

              <button
                type="button"
                className={rol === "admin" ? "role active" : "role"}
                onClick={() => setRol("admin")}
              >
                Administrador
              </button>

              <button
                type="button"
                className={rol === "alimentador" ? "role active" : "role"}
                onClick={() => setRol("alimentador")}
              >
                Alimentador
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Login;