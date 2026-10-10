import { apiFetch } from "./api";

export async function obtenerEvidencias(folio) {
    return apiFetch(`/reportes/${folio}/evidencias`);
}

export async function agregarEvidencias(folio, archivos) {
    const formData = new FormData();

    archivos.forEach((archivo) => {
        formData.append("archivos", archivo);
    });

    return apiFetch(`/reportes/${folio}/evidencias`, {
        method: "POST",
        body: formData,
    });
}