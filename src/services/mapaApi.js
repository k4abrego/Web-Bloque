import { apiFetch } from "./api";

export async function obtenerPuntosMapa(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, value);
        }
    });

    const url = query.toString()
        ? `/mapa/reportes?${query.toString()}`
        : "/mapa/reportes";

    return apiFetch(url);
}