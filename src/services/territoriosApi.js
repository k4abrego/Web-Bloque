import { apiFetch } from "./api";

export const MUNICIPIOS_SIPINNA = [
    "Atizapán de Zaragoza",
    "Cuautitlán",
    "Cuautitlán Izcalli",
    "Ecatepec",
    "Huixquilucan",
    "Isidro Fabela",
    "Jilotzingo",
    "Melchor Ocampo",
    "Naucalpan de Juárez",
    "Nicolás Romero",
    "Teoloyucan",
    "Tepotzotlán",
    "Tlalnepantla de Baz",
    "Tultitlán",
    "Villa del Carbón"
].sort();

export async function obtenerTerritorios() {
    return apiFetch("/territorios");
}

export async function obtenerTerritorioPorId(id) {
    return apiFetch(`/territorios/${id}`);
}