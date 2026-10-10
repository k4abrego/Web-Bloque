import { apiFetch } from "./api";

// Sección: obtenerAlimentadores.
export async function obtenerAlimentadores() {
    return apiFetch("/alimentadores");
}

// Sección: obtenerAlimentadorPorId.
export async function obtenerAlimentadorPorId(id) {
    return apiFetch(`/alimentadores/${id}`);
}   