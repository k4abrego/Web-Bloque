import { apiFetch } from "./api";

// Sección: obtenerTerritorios.
export async function obtenerTerritorios() {
    return apiFetch("/territorios");
}

// Sección: obtenerTerritorioPorId.
export async function obtenerTerritorioPorId(id) {
    return apiFetch(`/territorios/${id}`);
}