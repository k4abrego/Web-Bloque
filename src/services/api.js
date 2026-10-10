// URL base de las APIs
// Sección: COMMS_API_URL.
const COMMS_API_URL = import.meta.env.VITE_COMMS_API_URL;
// Sección: AUTH_API_URL.
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;

// función general para realizar peticiones HTTP
// Sección: request.
async function request(baseURL, endpoint, options = {}) {
// Sección: token.
  const token = localStorage.getItem("token");

  // configuración de encabezados
// Sección: headers.
  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

// Sección: response.
  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    headers,
  });

  // manejo de errores
  if (!response.ok) {
// Sección: error.
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
// Sección: apiFetch.
export async function apiFetch(endpoint, options = {}) {
  return request(COMMS_API_URL, endpoint, options);
}

// peticiones a Auth API
// Sección: authFetch.
export async function authFetch(endpoint, options = {}) {
  return request(AUTH_API_URL, endpoint, options);
}


// Sección: verificarChallenge.
export async function verificarChallenge(userId, respuestaHMAC) {
// Sección: response.
  const response = await fetch(
    `${import.meta.env.VITE_AUTH_API_URL}/Login/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        response: respuestaHMAC,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Correo o contraseña incorrectos.");
  }

  return response.json();
}