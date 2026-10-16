/** Pantalla temporal de alimentadores; conserva los registros de prueba existentes. */
import GestionCuentas from "./gestionCuentas";
import alimentadoresMock from "../../mocks/alimentadores";
import reportesMock from "../../mocks/reportes";

/** Adapta los mocks actuales al formulario con instituciones y varios municipios. */
const cuentas = alimentadoresMock.map(cuenta => ({
  ...cuenta,
  apellidos: cuenta.apellidos || "",
  institucion: cuenta.institucion || "",
  municipios: cuenta.municipios || (cuenta.municipio ? [cuenta.municipio] : []),
  reportes: reportesMock.filter(reporte => reporte.alimentador === cuenta.alias).length,
}));

/** Renderiza la gestión temporal de alimentadores. */
export default function AlimentadoresAdmin() {
  return <GestionCuentas tipo="alimentador" inicialesCuentas={cuentas} />;
}
  