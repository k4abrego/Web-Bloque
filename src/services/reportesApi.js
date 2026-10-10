import { apiFetch } from "./api";

export async function obtenerReporte(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([Key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(Key, value);
        }
    });

    const url = query.toString()
        ? `/reportes?${query.toString()}`
        : "/reportes";

    return apiFetch(url);
}

export async function obtenerReportePorId(folio){
    return apiFetch(`/reportes/${folio}`);
}

export async function actualizarEstadoReporte(folio, datos) {
    return apiFetch(`/reportes/${folio}`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

export async function asignarReporte(folio, idAlimentador) {
    return apiFetch(`/reportes/asignar/${folio}`, {
        method: "POST",
        body: JSON.stringify({
            id_alimentador: idAlimentador,
        }),
    });
    
}

