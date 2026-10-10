import { apiFetch } from "./api";

// Sección: obtenerPuntosMapa.
export async function obtenerPuntosMapa(params = {}) {
// Sección: query.
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });

// Sección: url.
    const url = query.toString()
        ? `/mapa/reportes?${query.toString()}`
        : "/mapa/reportes";

    return apiFetch(url);
}