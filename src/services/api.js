// URL base de las APIs
const COMMS_API_URL = import.meta.env.VITE_COMMS_API_URL;
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

// función general para realizar peticiones HTTP
async function request(baseURL, endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // configuración de encabezados
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  // manejo de errores
  if (!response.ok) {
    const error = new Error("Error al realizar la petición");
    error.status = response.status;
    throw error;
  }

  // respuestas sin contenido
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// peticiones a Comms API
export async function apiFetch(endpoint, options = {}) {
  return request(COMMS_API_URL, endpoint, options);
}

// peticiones a Auth API
export async function authFetch(endpoint, options = {}) {
  return request(AUTH_API_URL, endpoint, options);
}