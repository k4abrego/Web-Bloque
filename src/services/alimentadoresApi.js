import { apiFetch } from "./api";

export async function obtenerAlimentadores() {
    return apiFetch("/alimentadores");
}

export async function obtenerAlimentadorPorId(id) {
    return apiFetch(`/alimentadores/${id}`);
}   