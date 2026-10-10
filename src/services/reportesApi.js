import { apiFetch } from "./api";

// Sección: obtenerReporte.
export async function obtenerReporte(params = {}) {
// Sección: query.
    const query = new URLSearchParams();

    Object.entries(params).forEach(([Key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(Key, value);
        }
    });

// Sección: url.
    const url = query.toString()
        ? `/reportes?${query.toString()}`
        : "/reportes";

    return apiFetch(url);
}

// Sección: obtenerReportePorId.
export async function obtenerReportePorId(folio){
    return apiFetch(`/reportes/${folio}`);
}

// Sección: actualizarEstadoReporte.
export async function actualizarEstadoReporte(folio, datos) {
    return apiFetch(`/reportes/${folio}`, {
        method: "POST",
        body: JSON.stringify(datos),
    });
}

// Sección: asignarReporte.
export async function asignarReporte(folio, idAlimentador) {
    return apiFetch(`/reportes/asignar/${folio}`, {
        method: "POST",
        body: JSON.stringify({
            id_alimentador: idAlimentador,
        }),
    });
    
}

