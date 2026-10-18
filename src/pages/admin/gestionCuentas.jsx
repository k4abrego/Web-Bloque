/**
 * gestionCuentas.jsx
 *
 * Panel reutilizable de cuentas administrativas y alimentadoras.
 * Obtiene instituciones y territorios reales de comms-api.
 * Crear, editar y cambiar estados sigue siendo temporal en React.
 * La autorización efectiva corresponde al backend.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Users, UserCheck, UserX, Plus, Search, Pencil, Power, X,
} from "lucide-react";
import { apiFetch } from "../../services/api";
import "./alimentadoresAdmin.css";

/** Campos iniciales para crear una cuenta temporal. */
const NUEVO = {
  nombre: "", apellidos: "", correo: "", telefono: "",
  institucion: "", municipios: [],
};

/**
 * Genera iniciales de una cuenta a partir de su nombre completo.
 * @param {string} nombre - Nombre completo.
 * @returns {string} Hasta dos iniciales en mayúsculas.
 */
function iniciales(nombre) {
  return String(nombre || "").trim().split(/\s+/)
    .slice(0, 2).map((parte) => parte[0]?.toUpperCase() || "").join("");
}

/**
 * Obtiene los catálogos usados por las dos pantallas de cuentas.
 * @returns {Promise<{instituciones: object[], municipios: object[]}>}
 * @throws {Error} Si falla alguna petición o su estructura no es válida.
 */
async function consultarCatalogos() {
  const [respuestaInstituciones, respuestaTerritorios] = await Promise.all([
    apiFetch("/instituciones"),
    apiFetch("/territorios"),
  ]);

  if (!Array.isArray(respuestaInstituciones)) {
    throw new Error("La API no devolvió una lista válida de instituciones.");
  }
  if (!Array.isArray(respuestaTerritorios?.territorios)) {
    throw new Error("La API no devolvió una lista válida de territorios.");
  }

  return {
    instituciones: respuestaInstituciones.filter((item) => item?.id_institucion != null && item?.nombre),
    municipios: respuestaTerritorios.territorios.filter((item) => item?.id_territorio != null && item?.nombre),
  };
}

/**
 * Panel compartido para administrar cuentas de forma temporal.
 * @param {object} props - Propiedades de la pantalla.
 * @param {"alimentador"|"administrador"} props.tipo - Tipo de cuenta.
 * @param {object[]} [props.inicialesCuentas] - Cuentas iniciales, reales o de prueba.
 * @returns {import("react").JSX.Element} Panel de cuentas.
 */
export default function GestionCuentas({ tipo, inicialesCuentas = [] }) {
  const esAlimentador = tipo === "alimentador";
  const titulo = esAlimentador ? "alimentadores" : "administradores";
  const [cuentas, setCuentas] = useState(() => inicialesCuentas.map((cuenta) => ({
    ...cuenta, municipios: [...(cuenta.municipios || [])],
  })));
  const [institucionesCatalogo, setInstitucionesCatalogo] = useState([]);
  const [municipiosCatalogo, setMunicipiosCatalogo] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState("");
  const [intentoCatalogos, setIntentoCatalogos] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [municipio, setMunicipio] = useState("Todos");
  const [institucion, setInstitucion] = useState("Todas");
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({ ...NUEVO, municipios: [] });
  const [error, setError] = useState("");

  /** Solicita los catálogos al entrar o al pulsar Reintentar. */
  useEffect(() => {
    let vigente = true;

    consultarCatalogos()
      .then(({ instituciones, municipios }) => {
        if (!vigente) return;

        setInstitucionesCatalogo(instituciones);
        setMunicipiosCatalogo(municipios);
      })
      .catch((err) => {
        if (!vigente) return;

        setErrorCatalogos(
          err.message || "No fue posible consultar los catálogos."
        );
      })
      .finally(() => {
        if (vigente) setCargandoCatalogos(false);
      });

    return () => {
      vigente = false;
    };
  }, [intentoCatalogos]);

  /** Conserva las instituciones ya presentes en las cuentas durante una edición. */
  const nombresInstituciones = useMemo(() => Array.from(new Set([
    ...institucionesCatalogo.map((item) => item.nombre),
    ...cuentas.map((cuenta) => cuenta.institucion).filter(Boolean),
  ])).sort((a, b) => a.localeCompare(b, "es")), [institucionesCatalogo, cuentas]);

  /** Conserva también municipios previamente asignados a cuentas temporales. */
  const nombresMunicipios = useMemo(() => Array.from(new Set([
    ...municipiosCatalogo.map((item) => item.nombre),
    ...cuentas.flatMap((cuenta) => cuenta.municipios || []),
  ])).sort((a, b) => a.localeCompare(b, "es")), [municipiosCatalogo, cuentas]);

  /** Calcula las estadísticas de los registros visibles en esta pantalla. */
  const totalCuentas = cuentas.length;
  const cuentasActivas = cuentas.filter((cuenta) => cuenta.estado === "Activo").length;
  const cuentasInactivas = cuentas.filter((cuenta) => cuenta.estado === "Inactivo").length;

  /** Combina búsqueda por texto con los tres filtros de la vista. */
  const filtradas = useMemo(() => cuentas.filter((cuenta) => {
    const texto = [cuenta.nombre, cuenta.apellidos, cuenta.correo, cuenta.alias]
      .filter(Boolean).join(" ").toLocaleLowerCase("es");
    const coincideBusqueda = texto.includes(busqueda.trim().toLocaleLowerCase("es"));
    const coincideEstado = estado === "Todos" || cuenta.estado === estado;
    const coincideInstitucion = institucion === "Todas" ||
      (institucion === "Sin asignar" ? !cuenta.institucion : cuenta.institucion === institucion);
    const coincideMunicipio = municipio === "Todos" ||
      (municipio === "Sin asignar" ? !(cuenta.municipios || []).length : (cuenta.municipios || []).includes(municipio));
    return coincideBusqueda && coincideEstado && coincideInstitucion && coincideMunicipio;
  }), [cuentas, busqueda, estado, institucion, municipio]);

  /**
   * Abre el modal vacío o precargado para editar una cuenta.
   * @param {object|null} cuenta - Cuenta para editar o null para crear.
   */
  function abrir(cuenta = null) {
    setEditando(cuenta?.id ?? null);
    setFormulario(cuenta ? {
      nombre: cuenta.nombre || "", apellidos: cuenta.apellidos || "",
      correo: cuenta.correo || "", telefono: cuenta.telefono || "",
      institucion: cuenta.institucion || "", municipios: [...(cuenta.municipios || [])],
    } : { ...NUEVO, municipios: [] });
    setError("");
    setAbierto(true);
  }

  /** Cierra el modal sin modificar los registros. */
  function cerrar() {
    setAbierto(false);
    setEditando(null);
    setError("");
  }

  /**
   * Cambia un campo del formulario sin mutar su estado anterior.
   * @param {string} campo - Campo por actualizar.
   * @param {string} valor - Valor nuevo.
   */
  function cambiar(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
    setError("");
  }

  /**
   * Marca o desmarca un municipio; permite selección múltiple.
   * @param {string} valor - Nombre del municipio.
   */
  function alternarMunicipio(valor) {
    setFormulario((anterior) => ({
      ...anterior,
      municipios: anterior.municipios.includes(valor)
        ? anterior.municipios.filter((item) => item !== valor)
        : [...anterior.municipios, valor],
    }));
    setError("");
  }

  /**
   * Valida y guarda cambios únicamente en el estado de React.
   * @param {import("react").FormEvent<HTMLFormElement>} evento - Envío del formulario.
   */
  function guardar(evento) {
    evento.preventDefault();
    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      apellidos: formulario.apellidos.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      municipios: [...formulario.municipios],
    };
    if (!datos.nombre || !datos.apellidos || !datos.correo ||
        !datos.institucion || !datos.municipios.length) {
      setError("Completa los datos obligatorios, la institución y al menos un municipio.");
      return;
    }
    if (datos.telefono && !/^\+[1-9]\d{7,14}$/.test(datos.telefono)) {
      setError("El teléfono debe usar formato internacional, por ejemplo +525512345678.");
      return;
    }
    if (cuentas.some((cuenta) =>
      cuenta.correo.toLowerCase() === datos.correo && cuenta.id !== editando)) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }
    if (editando !== null) {
      setCuentas((anteriores) => anteriores.map((cuenta) =>
        cuenta.id === editando ? { ...cuenta, ...datos } : cuenta));
    } else {
      // Los IDs locales son provisionales, no identificadores de MariaDB.
      const id = Math.max(0, ...cuentas.map((cuenta) => Number(cuenta.id) || 0)) + 1;
      setCuentas((anteriores) => [...anteriores, {
        ...datos, id,
        alias: `${esAlimentador ? "Alimentador" : "Administrador"} ${String(id).padStart(2, "0")}`,
        estado: "Activo", reportes: 0,
      }]);
    }
    cerrar();
  }

  /**
   * Alterna el estado mostrado sin activar ni desactivar acceso real.
   * @param {number} id - Identificador de la cuenta en la vista.
   */
  function alternarEstado(id) {
    setCuentas((anteriores) => anteriores.map((cuenta) => cuenta.id === id
      ? { ...cuenta, estado: cuenta.estado === "Activo" ? "Inactivo" : "Activo" }
      : cuenta));
  }

  return (
    <div className="alimentadores-admin">
      <div className="alimentadores-header">
        <div>
          <h1>Cuentas de {titulo}</h1>
          <p>Administra las cuentas, instituciones y municipios asignados.</p>
        </div>
        <button type="button" className="alimentadores-boton-nuevo" onClick={() => abrir()}>
          <Plus size={18} /> Nueva cuenta
        </button>
      </div>

      {cargandoCatalogos && <p role="status">Cargando instituciones y municipios...</p>}
      {errorCatalogos && (
        <div role="alert" style={{ marginBottom: 16 }}>
          No se pudieron cargar todos los catálogos: {errorCatalogos}{" "}
          <button type="button" 
          onClick={() => {
                setCargandoCatalogos(true);
                setErrorCatalogos("");
                setIntentoCatalogos((n) => n + 1);
              }}>
            Reintentar
          </button>
        </div>
      )}

      <div className="alimentadores-resumen">
        <div className="alimentadores-resumen-card">
          <div className="alimentadores-resumen-icono total"><Users size={22} /></div>
          <div><span>Total de cuentas</span><strong>{totalCuentas}</strong></div>
        </div>
        <div className="alimentadores-resumen-card">
          <div className="alimentadores-resumen-icono activas"><UserCheck size={22} /></div>
          <div><span>Cuentas activas</span><strong>{cuentasActivas}</strong></div>
        </div>
        <div className="alimentadores-resumen-card">
          <div className="alimentadores-resumen-icono inactivas"><UserX size={22} /></div>
          <div><span>Cuentas inactivas</span><strong>{cuentasInactivas}</strong></div>
        </div>
      </div>

      <div className="alimentadores-herramientas">
        <div className="alimentadores-buscador">
          <Search size={18} />
          <input type="text" placeholder="Buscar por nombre o correo..." value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} />
        </div>
        <select aria-label="Filtrar por estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="Todos">Todas las cuentas</option>
          <option value="Activo">Activas</option>
          <option value="Inactivo">Inactivas</option>
        </select>
        <select aria-label="Filtrar por institución" value={institucion}
          onChange={(e) => setInstitucion(e.target.value)}>
          <option value="Todas">Todas las instituciones</option>
          {nombresInstituciones.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          <option value="Sin asignar">Sin asignar</option>
        </select>
        <select aria-label="Filtrar por municipio" value={municipio}
          onChange={(e) => setMunicipio(e.target.value)}>
          <option value="Todos">Todos los municipios</option>
          {nombresMunicipios.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
          <option value="Sin asignar">Sin asignar</option>
        </select>
      </div>

      <div className="alimentadores-lista">
        <div className="alimentadores-lista-header">
          <h2>Personal {titulo}</h2>
          <span>{filtradas.length} de {totalCuentas} cuentas</span>
        </div>
        <div className="alimentadores-tabla-scroll">
          <table className="alimentadores-tabla">
            <thead><tr>
              <th>{esAlimentador ? "Alimentador" : "Administrador"}</th>
              <th>Correo electrónico</th>
              <th>Institución</th>
              <th>Municipios</th>
              {esAlimentador && <th>Reportes asignados</th>}
              <th>Estado</th>
              <th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtradas.length ? filtradas.map((cuenta) => (
                <tr key={cuenta.id}>
                  <td><div className="alimentador-identidad">
                    <div className="alimentador-avatar">
                      {iniciales(`${cuenta.nombre} ${cuenta.apellidos || ""}`)}
                    </div>
                    <div className="alimentador-nombre">
                      <strong>{cuenta.nombre} {cuenta.apellidos || ""}</strong>
                      {/* <span>{cuenta.alias || `Cuenta ${cuenta.id}`}</span> */}
                    </div>
                  </div></td>
                  <td><span className="alimentador-correo">{cuenta.correo}</span></td>
                  <td>{cuenta.institucion || "Sin asignar"}</td>
                  <td>{cuenta.municipios?.length ? cuenta.municipios.join(", ") : "Sin asignar"}</td>
                  {esAlimentador && <td><span className="alimentador-reportes">{cuenta.reportes ?? 0}</span></td>}
                  <td><span className={`alimentador-estado ${cuenta.estado === "Activo" ? "activo" : "inactivo"}`}>
                    {cuenta.estado}
                  </span></td>
                  <td><div className="alimentador-acciones">
                    <button type="button" className="alimentador-accion-editar" onClick={() => abrir(cuenta)}>
                      <Pencil size={15} /> Editar
                    </button>
                    <button type="button"
                      className={`alimentador-accion-estado ${cuenta.estado === "Activo" ? "desactivar" : "activar"}`}
                      onClick={() => alternarEstado(cuenta.id)}>
                      <Power size={15} /> {cuenta.estado === "Activo" ? "Desactivar" : "Activar"}
                    </button>
                  </div></td>
                </tr>
              )) : (
                <tr><td colSpan={esAlimentador ? 7 : 6}>
                  <div className="alimentadores-vacio">
                    <Users size={30} /><strong>No se encontraron cuentas</strong>
                    <p>Modifica la búsqueda o los filtros.</p>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="alimentadores-nota">
        Las consultas de catálogos son reales. Crear, editar y activar o desactivar cuentas
        solo modifica temporalmente la pantalla, no la base de datos.
      </p>

      {abierto && (
        <div className="alimentador-modal-fondo">
          <div className="alimentador-modal" role="dialog" aria-modal="true"
            aria-labelledby="gestion-cuentas-modal-titulo">
            <div className="alimentador-modal-header">
              <div>
                <h2 id="gestion-cuentas-modal-titulo">{editando !== null ? "Editar cuenta" : "Nueva cuenta"}</h2>
                <p>Registra la información del personal {esAlimentador ? "alimentador." : "administrador."}</p>
              </div>
              <button type="button" className="alimentador-modal-cerrar" onClick={cerrar}
                aria-label="Cerrar formulario"><X size={20} /></button>
            </div>
            <form onSubmit={guardar}>
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-nombre">Nombre</label>
                <input id="gestion-nombre" type="text" minLength={3} maxLength={30}
                  value={formulario.nombre} onChange={(e) => cambiar("nombre", e.target.value)} required />
              </div>
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-apellidos">Apellidos</label>
                <input id="gestion-apellidos" type="text" minLength={3} maxLength={100}
                  value={formulario.apellidos} onChange={(e) => cambiar("apellidos", e.target.value)} required />
              </div>
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-correo">Correo electrónico</label>
                <input id="gestion-correo" type="email" value={formulario.correo}
                  onChange={(e) => cambiar("correo", e.target.value)} required />
              </div>
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-telefono">Teléfono (opcional)</label>
                <input id="gestion-telefono" type="tel" placeholder="+525512345678"
                  value={formulario.telefono} onChange={(e) => cambiar("telefono", e.target.value)} />
              </div>
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-institucion">Institución</label>
                <select id="gestion-institucion" value={formulario.institucion}
                  onChange={(e) => cambiar("institucion", e.target.value)}
                  disabled={cargandoCatalogos || !!errorCatalogos} required>
                  <option value="">Selecciona una institución</option>
                  {nombresInstituciones.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
                </select>
              </div>
              <div className="alimentador-formulario-campo">
                <label>Municipios asignados</label>
                <div className="gestion-municipios-selector">
                  {cargandoCatalogos && <span>Cargando municipios...</span>}
                  {!cargandoCatalogos && !errorCatalogos && !nombresMunicipios.length &&
                    <span>No hay municipios disponibles.</span>}
                  {nombresMunicipios.map((nombre) => (
                    <label key={nombre} className="gestion-municipio-opcion">
                      <input type="checkbox" checked={formulario.municipios.includes(nombre)}
                        disabled={cargandoCatalogos || !!errorCatalogos}
                        onChange={() => alternarMunicipio(nombre)} />
                      <span>{nombre}</span>
                    </label>
                  ))}
                </div>
                <small className="gestion-municipios-ayuda">Puedes seleccionar varios municipios.</small>
              </div>
              {error && <p className="alimentador-formulario-error" role="alert">{error}</p>}
              <div className="alimentador-modal-acciones">
                <button type="button" className="alimentador-boton-cancelar" onClick={cerrar}>Cancelar</button>
                <button type="submit" className="alimentador-boton-guardar"
                  disabled={cargandoCatalogos || !!errorCatalogos}>
                  {editando !== null ? "Guardar cambios" : "Crear cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
