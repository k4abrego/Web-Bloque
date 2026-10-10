import { apiFetch } from "./api";

export async function obtenerTerritorios() {
    return apiFetch("/territorios");
}

export async function obtenerTerritorioPorId(id) {
    return apiFetch(`/territorios/${id}`);
}