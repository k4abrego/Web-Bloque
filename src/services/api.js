import { atenderDemoAdmin } from "./demoAdmin";
/**
 * URL base de la API de autenticación.
 *
 * Se obtiene mediante una variable de entorno para permitir
 * cambiar la dirección del backend sin modificar el código fuente.
 *
 * @type {string}
 */
const VITE_AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

/**
 * URL base de la API de comunicación.
 *
 * Se obtiene mediante una variable de entorno para permitir
 * cambiar la dirección del backend sin modificar el código fuente.
 *
 * @type {string}
 */ 
const VITE_COMMS_API_URL = import.meta.env.VITE_COMMS_API_URL;

/**
 * Crea una función para realizar peticiones HTTP hacia una API específica.
 *
 * La función generada:
 * - Agrega Content-Type: application/json cuando corresponde.
 * - Agrega automáticamente el token JWT almacenado en localStorage.
 * - Permite enviar archivos mediante FormData.
 * - Maneja respuestas 204 No Content.
 * - Convierte los errores HTTP en objetos Error con código de estado.
 *
 * @param {string} baseURL - URL base de la API.
 * @returns {Function} Función para realizar peticiones HTTP.
 */
function createApiFetch(baseURL) {
    return async function apiFetch(endpoint, options = {}) {
    const demo = atenderDemoAdmin(endpoint, options);
    if (demo.handled) return demo.result;

        /**
         * Indica si la respuesta debe recibirse como archivo binario.
         * Se elimina de las opciones enviadas a fetch.
         */
        const { responseType = "json", ...fetchOptions } = options;

        /**
         * Token JWT de la sesión actual.
         * Se incluye automáticamente en las peticiones autenticadas.
         */
        const token = localStorage.getItem("token");

        /**
         * Encabezados de la solicitud.
         *
         * FormData no requiere Content-Type manual porque el navegador
         * debe establecer automáticamente el boundary del multipart.
         */
        const headers = {
            ...(options.body instanceof FormData
                ? {}
                : { "Content-Type": "application/json" }),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        /**
         * Ejecuta la petición HTTP.
         */
        let response;

        try {
            response = await fetch(`${baseURL}${endpoint}`, {
                ...fetchOptions,
                headers,
            });
        } catch {
            const connectionError = new Error(
                "No se pudo conectar con el servidor. Verifica que el servicio esté disponible."
            );

            connectionError.code = "CONNECTION_ERROR";

            throw connectionError;
        }

        /**
         * Si el servidor devuelve un código HTTP de error,
         * intenta obtener el mensaje proporcionado por la API.
         */
        if (!response.ok) {
            let message = "Error en la solicitud.";

            try {
                const errorData = await response.json();

                message =
                    errorData.error ||
                    errorData.mensaje ||
                    message;
            } catch {
                // La respuesta no contiene un cuerpo JSON.
            }

            const error = new Error(message);

            /**
             * Conserva el código HTTP para que las vistas puedan
             * distinguir errores como 401, 404, 500, etc.
             */
            error.status = response.status;

            throw error;
        }

        /**
         * Las respuestas 204 no contienen información en el cuerpo.
         */
        if (response.status === 204) {
            return null;
        }

        /**
         * Permite descargar imágenes y videos sin intentar
         * interpretar su contenido como JSON.
         */
        if (responseType === "blob") {
            return response.blob();
        }

        return response.json();
    };
}

/**
 * Cliente HTTP para la API de autenticación.
 *
 * Base configurada mediante VITE_AUTH_API_URL.
 */
export const authApiFetch = createApiFetch(VITE_AUTH_API_URL);

/**
 * Cliente HTTP para la API de comunicación.
 *
 * Base configurada mediante VITE_COMMS_API_URL.
 */
export const apiFetch = createApiFetch(VITE_COMMS_API_URL);
    