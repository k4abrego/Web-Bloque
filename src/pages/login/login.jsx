import {
    solicitarChallenge,
    verificarChallenge,
    guardarSesion,
} from "../../services/authApi";

import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { generarHMAC } from "../../services/hmac";

import logoSIPINNA from "../../assets/sipinnalogo.png";
import "./login.css";

/**
 * Página de inicio de sesión del sistema SIPINNA.
 *
 * Implementa el flujo de autenticación mediante challenge:
 *
 * 1. El usuario proporciona su correo y contraseña.
 * 2. Se solicita un challenge a la Auth API.
 * 3. Se calcula la respuesta HMAC-SHA256 utilizando la contraseña
 *    y el challenge recibido.
 * 4. Se envía la respuesta a la Auth API.
 * 5. Si la autenticación es válida, se recibe un token JWT.
 * 6. El token se almacena localmente para utilizarlo en las
 *    peticiones posteriores.
 *
 * @returns {JSX.Element} Vista del formulario de inicio de sesión.
 */

function normalizarRol(rol) {
    if (!rol) return null;

    const rolNormalizado = rol.toLowerCase();

    if (
        rolNormalizado === "admin" ||
        rolNormalizado === "administrador" ||
        rolNormalizado === "administrator"
    ) {
        return "admin";
    }

    if (
        rolNormalizado === "alimentador" ||
        rolNormalizado === "feeder"
    ) {
        return "alimentador";
    }

    return null;
}

function Login() {
    /**
     * Correo electrónico introducido por el usuario.
     *
     * @type {[string, Function]}
     */
    const [correo, setCorreo] = useState("");

    /**
     * Contraseña introducida por el usuario.
     *
     * @type {[string, Function]}
     */
    const [contrasena, setContrasena] = useState("");

    /**
     * Rol seleccionado para la navegación del frontend.
     *
     * El rol no sustituye la autorización del backend.
     *
     * @type {[string, Function]}
     */
    const [rol, setRol] = useState("admin");

    /**
     * Controla si la contraseña se muestra como texto.
     *
     * @type {[boolean, Function]}
     */
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    /**
     * Indica si actualmente se está realizando una solicitud
     * de autenticación.
     *
     * @type {[boolean, Function]}
     */
    const [cargando, setCargando] = useState(false);

    /**
     * Mensaje de error mostrado al usuario.
     *
     * @type {[string, Function]}
     */
    const [error, setError] = useState("");

    /**
     * Función de navegación proporcionada por React Router.
     */
    const navigate = useNavigate();

    /**
     * Procesa el envío del formulario de inicio de sesión.
     *
     * Ejecuta el flujo completo de autenticación mediante challenge:
     *
     * 1. Solicita un challenge utilizando el correo.
     * 2. Calcula la respuesta HMAC-SHA256.
     * 3. Envía la respuesta al backend.
     * 4. Guarda el token JWT recibido.
     * 5. Redirige al panel correspondiente al rol seleccionado.
     *
     * @param {React.FormEvent<HTMLFormElement>} e - Evento del formulario.
     * @returns {Promise<void>}
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setCargando(true);

        try {
            /**
             * Paso 1:
             * Solicitar el challenge al servicio de autenticación.
             */
            const { challenge, user_id } =
                await solicitarChallenge(correo.trim());

            if (!challenge || user_id == null) {
                throw new Error(
                    "La respuesta del servicio de autenticación no es válida."
                );
            }

            /**
             * Paso 2:
             * Calcular la respuesta HMAC-SHA256 utilizando
             * la contraseña y el challenge.
             */
            const respuestaHMAC = await generarHMAC(
                contrasena,
                challenge
            );

            /**
             * Paso 3:
             * Enviar la respuesta calculada al backend
             * para completar la autenticación.
             */
            const datos = await verificarChallenge(
                user_id,
                respuestaHMAC
            );

            /**
             * Paso 4:
             * Verificar que la API haya proporcionado
             * un token JWT.
             */
            if (!datos?.token) {
    throw new Error(
        "El servidor no devolvió un token de autenticación."
    );
    }

            /**
             * Normaliza el rol recibido desde Auth API.
             */
            const rolBackend = normalizarRol(datos.rol);

            if (!rolBackend) {
                throw new Error(
                    "El servidor no devolvió un rol reconocido."
                );
            }

            guardarSesion(datos.token, rolBackend);

            if (rolBackend === "admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/alimentador", { replace: true });
            }

        } catch (err) {
            /**
             * Muestra el mensaje de error generado por la API
             * o un mensaje genérico cuando no existe uno.
             */
            setError(
                err.message ||
                "No se pudo iniciar sesión. Verifica tus datos."
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-page">

            {/* Identidad visual de SIPINNA */}
            <div className="login-side">
                <div className="login-brand">

                    <img
                        src={logoSIPINNA}
                        alt="Logo SIPINNA"
                        className="sipinna-logo"
                    />

                    <h2>
                        <strong>Administrador:</strong> perteneces al
                        Sistema de Protección Integral de Niñas, Niños y
                        Adolescentes.

                        <br />
                        <br />

                        <strong>Alimentador:</strong> perteneces a una
                        organización que no es SIPINNA y gestionas reportes
                        de una zona específica.
                    </h2>

                </div>
            </div>

            {/* Formulario de autenticación */}
            <div className="login-main">

                <div className="login-card">

                    {/* Icono */}
                    <div className="login-icon">
                        <ShieldCheck size={42} />
                    </div>

                    {/* Título */}
                    <h1>Inicio de sesión</h1>

                    <p className="login-description">
                        Sistema de administración de reportes
                    </p>

                    <form onSubmit={handleSubmit}>

                        {/* Correo */}
                        <div className="form-group">

                            <label htmlFor="correo">
                                Correo electrónico
                            </label>

                            <input
                                id="correo"
                                type="email"
                                placeholder="correo@sipinna.com"
                                value={correo}
                                onChange={(e) =>
                                    setCorreo(e.target.value)
                                }
                                required
                                disabled={cargando}
                            />

                        </div>

                        {/* Contraseña */}
                        <div className="form-group">

                            <label htmlFor="contrasena">
                                Contraseña
                            </label>

                            <div className="password-input-container">

                                <input
                                    id="contrasena"
                                    type={
                                        mostrarContrasena
                                            ? "text"
                                            : "password"
                                    }
                                    placeholder="Ingresa tu contraseña"
                                    value={contrasena}
                                    onChange={(e) =>
                                        setContrasena(e.target.value)
                                    }
                                    required
                                    disabled={cargando}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setMostrarContrasena(
                                            !mostrarContrasena
                                        )
                                    }
                                    aria-label={
                                        mostrarContrasena
                                            ? "Ocultar contraseña"
                                            : "Mostrar contraseña"
                                    }
                                    disabled={cargando}
                                >
                                    {mostrarContrasena ? (
                                        <EyeOff size={19} />
                                    ) : (
                                        <Eye size={19} />
                                    )}
                                </button>

                            </div>
                        </div>

                        {/* Recuperación de contraseña */}
                        <div className="forgot-password">

                            <button type="button">
                                ¿Olvidaste tu contraseña?
                            </button>

                        </div>

                        {/* Mensaje de error */}
                        {error && (
                            <p
                                className="login-error"
                                role="alert"
                            >
                                {error}
                            </p>
                        )}

                        {/* Botón de inicio de sesión */}
                        <button
                            className="login-button"
                            type="submit"
                            disabled={cargando}
                        >
                            {cargando
                                ? "Iniciando sesión..."
                                : "Iniciar sesión"}
                        </button>

                        {/* Selector de rol */}
                        <div className="role-selector">

                            <button
                                type="button"
                                className={
                                    rol === "admin"
                                        ? "role active"
                                        : "role"
                                }
                                onClick={() => setRol("admin")}
                                disabled={cargando}
                            >
                                Administrador
                            </button>

                            <button
                                type="button"
                                className={
                                    rol === "alimentador"
                                        ? "role active"
                                        : "role"
                                }
                                onClick={() =>
                                    setRol("alimentador")
                                }
                                disabled={cargando}
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