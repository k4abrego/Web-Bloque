import { apiFetch } from "./api";

// Sección: obtenerEvidencias.
export async function obtenerEvidencias(folio) {
    return apiFetch(`/reportes/${folio}/evidencias`);
}

// Sección: agregarEvidencias.
export async function agregarEvidencias(folio, archivos) {
// Sección: formData.
    const formData = new FormData();

    archivos.forEach((archivo) => {
        formData.append("archivos", archivo);
    });

    return apiFetch(`/reportes/${folio}/evidencias`, {
        method: "POST",
        body: formData,
    });
}