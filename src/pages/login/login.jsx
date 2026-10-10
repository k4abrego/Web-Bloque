// Imports
import { ShieldCheck, Eye, EyeOff } from "lucide-react"
import { useState } from "react";
import "./login.css";
import logoSIPINNA from "../../assets/sipinnalogo.png"
// import { useNavigate } from "react-router-dom";
import { solicitarChallenge } from "../../services/authApi";

// Crea la panralla de inicio de sesión
function Login() {

  // Guarda los datos ingresados y opciones del formulario
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [rol, setRol] = useState("admin");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  // Controla lpo que pasa cuando el usuario quiere iniciar sesión
  

  /**
   * Controla el envío del formulario de inicio de sesión.
   * Solicita el challenge al backend de autenticación.
   *
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    try {
      // Solicitar challenge al backend
      const datos = await solicitarChallenge(correo.trim());

      // Verificar que el backend devolvió los datos esperados
      if (!datos.challenge || datos.user_id == null) {
        throw new Error("Respuesta inválida del servidor.");
      }

      // Autenticación HMAC pendiente de implementar
      setError(
        "Conexión con Auth API correcta. Falta completar la autenticación HMAC."
      );

    } catch (err) {
      setError(err.message || "Error al conectar con Auth API.");
    } finally {
      setCargando(false);
    }
  };



  // const navigate = useNavigate();

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");


  return (
    // Pagina de login general
    <div className="login-page">


      {/* Lado Izquierdo
      Muestra la identidad visual de sipinna */}
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


      {/* Lado derecho
      Formulario para iniciar sesion */}
      <div className="login-main">

        <div className="login-card">

          {/* Icono superior del formulario */}
          <div className="login-icon">
            <ShieldCheck size={42} />
          </div>


          {/* titulo del inicio de sesion */}
          <h1>Inicio de sesión</h1>
          <p className="login-description">
            Sistema de administración de reportes
          </p>


          {/* Formulario 
          Recibe credenciales del usuario */}
          <form onSubmit={handleSubmit}>

            {/* Para ingresar el correo */}
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


            {/* Para ingresar la contraseña */}
            <div className="form-group">
              <label htmlFor="contrasena">
                Contraseña
              </label>

              {/* Contraseña y boton del ojito */}
              <div className="password-input-container">
            

              <input
                id="contrasena"
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            
              {/* Cambua entre mostrar y ocultar contraseña */}
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


            {/* Opcion para recuperar una contraseña olvidada*/}
            <div className="forgot-password">
              <button type="button">
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Mensaje de error o estado de autenticación */}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            {/* Boton para enviar el formulario */}
            <button
              className="login-button"
              type="submit"
              disabled={cargando}
            >
              {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>


            {/* Selector de Rol */}
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