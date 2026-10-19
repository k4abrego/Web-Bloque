/**
 * @file filtrosAdmin.jsx
 * @description Administración real de etiquetas SIPINNA.
 *
 * - Búsqueda avanzada de expedientes con AND/OR.
 * - Selección individual o múltiple de reportes.
 * - Consulta del catálogo real de etiquetas.
 * - Creación y edición de etiquetas.
 * - Aplicación real de etiquetas a reportes.
 *
 * Las modificaciones se realizan exclusivamente mediante
 * comms-api y requieren autorización de Administrador.
 */

import { useEffect, useMemo, useState } from "react";
import {
  Search, Plus, Minus, RotateCcw, RefreshCw,
  SlidersHorizontal, Tags, Tag, Pencil, CheckSquare,
} from "lucide-react";

import { apiFetch } from "../../services/api";
import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { valoresEtiqueta, opcionesEtiqueta } from "../../services/etiquetasReportes";

import "./filtrosAdmin.css";

const TIPOS = ["Categoria", "Riesgo", "Prioridad"];

const CAMPOS = [
  { valor: "folio", nombre: "Folio" },
  { valor: "estado", nombre: "Estado" },
  { valor: "id_territorio", nombre: "Territorio" },
  { valor: "descripcion", nombre: "Descripción" },
  { valor: "Observación", nombre: "Observación" },
  { valor: "Categoria", nombre: "Categoría" },
  { valor: "Riesgo", nombre: "Riesgo" },
  { valor: "Prioridad", nombre: "Prioridad" },
];

/** Construye una condición para la búsqueda avanzada. */
function nuevaCondicion() {
  return {
    id: crypto.randomUUID(),
    conector: "AND",
    campo: "",
    valor: "",
  };
}

/**
 * Comprueba una condición sobre un expediente real.
 *
 * @param {Object} reporte - Expediente obtenido del backend.
 * @param {Object} condicion - Filtro solicitado.
 * @returns {boolean}
 */
function cumpleCondicion(reporte, condicion) {
  if (!condicion.campo || !condicion.valor) return true;

  const valor = condicion.valor.trim().toLocaleLowerCase("es");

  if (
    condicion.campo === "Observación" ||
    TIPOS.includes(condicion.campo)
  ) {
    return valoresEtiqueta(reporte, condicion.campo).some(
      (etiqueta) =>
        String(etiqueta).toLocaleLowerCase("es") === valor
    );
  }

  return String(reporte[condicion.campo] ?? "")
    .toLocaleLowerCase("es")
    .includes(valor);
}

/**
 * Evalúa las condiciones combinadas de izquierda a derecha.
 *
 * @param {Object} reporte
 * @param {Object[]} condiciones
 * @returns {boolean}
 */
function coincideBusqueda(reporte, condiciones) {
  const activas = condiciones.filter(
    (item) => item.campo && item.valor.trim()
  );

  if (!activas.length) return true;

  let coincide = cumpleCondicion(reporte, activas[0]);

  for (let i = 1; i < activas.length; i++) {
    const actual = cumpleCondicion(reporte, activas[i]);

    coincide =
      activas[i].conector === "OR"
        ? coincide || actual
        : coincide && actual;
  }

  return coincide;
}

/**
 * Gestiona las clasificaciones de los reportes.
 *
 * @returns {import("react").JSX.Element}
 */
export default function FiltrosAdmin() {
  const [reportes, setReportes] = useState([]);
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [revision, setRevision] = useState(0);

  const [condiciones, setCondiciones] = useState([
    nuevaCondicion(),
  ]);
  const [busqueda, setBusqueda] = useState([]);
  const [busquedaActiva, setBusquedaActiva] = useState(false);
  const [seleccionados, setSeleccionados] = useState([]);

  const [tipoAplicar, setTipoAplicar] = useState("");
  const [nombreAplicar, setNombreAplicar] = useState("");

  const [tipoNuevo, setTipoNuevo] = useState("Categoria");
  const [nombreNuevo, setNombreNuevo] = useState("");

  /** Consulta reportes y catálogo desde sus endpoints reales. */
  useEffect(() => {
    let vigente = true;

    Promise.all([
      obtenerHistoricoReportes(),
      apiFetch("/etiquetas"),
    ])
      .then(([datosReportes, datosEtiquetas]) => {
        if (!vigente) return;

        if (
          !Array.isArray(datosReportes) ||
          !Array.isArray(datosEtiquetas)
        ) {
          throw new Error("Las respuestas del servidor no son válidas.");
        }

        setReportes(datosReportes);
        setCatalogo(datosEtiquetas);
        setError("");
      })
      .catch((err) => {
        if (vigente) {
          setError(
            err.message ||
            "No se pudieron cargar los datos del sistema."
          );
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [revision]);

  /** Reportes que cumplen las condiciones aplicadas. */
  const resultados = useMemo(() => {
    if (!busquedaActiva) return [];

    return reportes.filter((reporte) =>
      coincideBusqueda(reporte, busqueda)
    );
  }, [reportes, busqueda, busquedaActiva]);

  /** Catálogo de etiquetas disponibles para asignación. */
  const etiquetasAplicables = useMemo(() => {
    return catalogo.filter(
      (etiqueta) =>
        etiqueta.es_activo &&
        etiqueta.tipo === tipoAplicar
    );
  }, [catalogo, tipoAplicar]);

  /** Valores para los campos de búsqueda avanzada. */
  function opciones(campo) {
    if (campo === "Observación" || TIPOS.includes(campo)) {
      return opcionesEtiqueta(reportes, campo);
    }

    if (campo === "estado" || campo === "id_territorio") {
      return [
        ...new Set(
          reportes
            .map((reporte) => reporte[campo])
            .filter((valor) => valor != null)
            .map(String)
        ),
      ].sort((a, b) => a.localeCompare(b, "es"));
    }

    return [];
  }

  /** Actualiza una condición, reiniciando su valor al cambiar campo. */
  function actualizarCondicion(id, campo, valor) {
    setCondiciones((actuales) =>
      actuales.map((item) =>
        item.id === id
          ? {
              ...item,
              [campo]: valor,
              ...(campo === "campo" ? { valor: "" } : {}),
            }
          : item
      )
    );
  }

  /** Ejecuta los filtros y reinicia la selección. */
  function buscar() {
    setBusqueda(condiciones.map((item) => ({ ...item })));
    setBusquedaActiva(true);
    setSeleccionados([]);
    setAviso("");
  }

  /** Limpia búsqueda y selección de expedientes. */
  function limpiar() {
    setCondiciones([nuevaCondicion()]);
    setBusqueda([]);
    setBusquedaActiva(false);
    setSeleccionados([]);
    setAviso("");
  }

  /** Marca o desmarca un folio de los resultados. */
  function seleccionar(folio, marcado) {
    setSeleccionados((anteriores) =>
      marcado
        ? [...new Set([...anteriores, folio])]
        : anteriores.filter((item) => item !== folio)
    );
  }

  /** Selecciona o deselecciona todos los resultados visibles. */
  function seleccionarTodos(marcado) {
    const folios = resultados.map((reporte) => reporte.folio);

    setSeleccionados((anteriores) =>
      marcado
        ? [...new Set([...anteriores, ...folios])]
        : anteriores.filter((folio) => !folios.includes(folio))
    );
  }

  /** Consulta nuevamente el servidor sin inventar cambios locales. */
  function recargar() {
    setCargando(true);
    setRevision((valor) => valor + 1);
  }

  /** Aplica una etiqueta real a los folios seleccionados. */
  async function aplicarEtiqueta() {
    if (!seleccionados.length || !tipoAplicar || !nombreAplicar) {
      setError("Selecciona reportes y una etiqueta existente.");
      return;
    }

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      await apiFetch("/etiquetas/aplicar", {
        method: "POST",
        body: JSON.stringify({
          folios: seleccionados,
          nombre_etiqueta: nombreAplicar,
          tipo: tipoAplicar,
        }),
      });

      setAviso(
        `Etiqueta aplicada a ${seleccionados.length} reporte(s).`
      );
      setSeleccionados([]);
      recargar();
    } catch (err) {
      setError(err.message || "No se pudo aplicar la etiqueta.");
    } finally {
      setGuardando(false);
    }
  }

  /** Registra una etiqueta nueva en el catálogo de MariaDB. */
  async function crearEtiqueta(evento) {
    evento.preventDefault();

    const nombre = nombreNuevo.trim();
    if (!nombre || nombre.length > 50) {
      setError("Escribe un nombre de hasta 50 caracteres.");
      return;
    }

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      await apiFetch("/etiquetas", {
        method: "POST",
        body: JSON.stringify({
          nombre_etiqueta: nombre,
          tipo: tipoNuevo,
        }),
      });

      setNombreNuevo("");
      setAviso("Etiqueta registrada en el catálogo.");
      recargar();
    } catch (err) {
      setError(err.message || "No se pudo registrar la etiqueta.");
    } finally {
      setGuardando(false);
    }
  }

  /** Renombra una etiqueta sin perder las asociaciones existentes. */
  async function editarEtiqueta(etiqueta) {
    const nuevo = window.prompt(
      "Nuevo nombre de la etiqueta:",
      etiqueta.nombre_etiqueta
    );

    if (nuevo === null) return;
    const nombre = nuevo.trim();

    if (!nombre || nombre.length > 50) {
      setError("El nombre debe tener entre 1 y 50 caracteres.");
      return;
    }
    if (nombre === etiqueta.nombre_etiqueta) return;

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      await apiFetch("/etiquetas", {
        method: "PATCH",
        body: JSON.stringify({
          tipo: etiqueta.tipo,
          nombre_actual: etiqueta.nombre_etiqueta,
          nombre_nuevo: nombre,
        }),
      });

      setAviso("Etiqueta actualizada correctamente.");
      recargar();
    } catch (err) {
      setError(err.message || "No se pudo editar la etiqueta.");
    } finally {
      setGuardando(false);
    }
  }

  /** Cuenta expedientes relacionados con una etiqueta. */
  function contarEtiqueta(etiqueta) {
    return reportes.filter((reporte) =>
      valoresEtiqueta(reporte, etiqueta.tipo).includes(
        etiqueta.nombre_etiqueta
      )
    ).length;
  }

  const todosSeleccionados =
    resultados.length > 0 &&
    resultados.every((reporte) =>
      seleccionados.includes(reporte.folio)
    );

  return (
    <div className="filtros-admin">
      <div className="filtros-header">
        <div>
          <h1>Filtros y etiquetas</h1>
          <p>
            Selecciona expedientes, aplica etiquetas y
            administra las clasificaciones de SIPINNA.
          </p>
        </div>

        <button
          type="button"
          className="boton-buscar"
          onClick={recargar}
          disabled={cargando || guardando}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </div>

      {cargando && (
        <p role="status">Consultando información de MariaDB...</p>
      )}
      {error && (
        <p role="alert" style={{ color: "#b42332", marginBottom: 16 }}>
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" style={{ color: "#217650", marginBottom: 16 }}>
          {aviso}
        </p>
      )}

      <div className="busqueda-avanzada-card">
        <div className="busqueda-avanzada-header">
          <div className="busqueda-avanzada-icono">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <h2>Búsqueda avanzada</h2>
            <p>
              Busca expedientes para aplicar etiquetas usando AND y OR.
            </p>
          </div>
        </div>

        <div className="condiciones-lista">
          {condiciones.map((condicion, indice) => (
            <div className="condicion-fila" key={condicion.id}>
              {indice > 0 && (
                <select
                  className="condicion-conector"
                  aria-label="Conector lógico"
                  value={condicion.conector}
                  onChange={(e) =>
                    actualizarCondicion(
                      condicion.id, "conector", e.target.value
                    )
                  }
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              )}

              <select
                className="condicion-campo"
                aria-label="Campo de búsqueda"
                value={condicion.campo}
                onChange={(e) =>
                  actualizarCondicion(
                    condicion.id, "campo", e.target.value
                  )
                }
              >
                <option value="">Selecciona un campo</option>
                {CAMPOS.map((campo) => (
                  <option key={campo.valor} value={campo.valor}>
                    {campo.nombre}
                  </option>
                ))}
              </select>

              {opciones(condicion.campo).length ? (
                <select
                  className="condicion-valor"
                  aria-label="Valor de búsqueda"
                  value={condicion.valor}
                  onChange={(e) =>
                    actualizarCondicion(
                      condicion.id, "valor", e.target.value
                    )
                  }
                >
                  <option value="">Selecciona un valor</option>
                  {opciones(condicion.campo).map((valor) => (
                    <option key={valor} value={valor}>
                      {valor}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="condicion-valor"
                  type="text"
                  placeholder="Valor a buscar"
                  disabled={!condicion.campo}
                  value={condicion.valor}
                  onChange={(e) =>
                    actualizarCondicion(
                      condicion.id, "valor", e.target.value
                    )
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="condiciones-acciones">
          <button
            type="button"
            onClick={() =>
              setCondiciones((actuales) => [
                ...actuales, nuevaCondicion(),
              ])
            }
          >
            <Plus size={16} />
            Agregar condición
          </button>

          <button
            type="button"
            disabled={condiciones.length === 1}
            onClick={() =>
              setCondiciones((actuales) => actuales.slice(0, -1))
            }
          >
            <Minus size={16} />
            Quitar condición
          </button>
        </div>

        <div className="busqueda-acciones">
          <button
            type="button"
            className="boton-buscar"
            onClick={buscar}
            disabled={cargando}
          >
            <Search size={16} />
            Buscar reportes
          </button>

          <button type="button" onClick={limpiar}>
            <RotateCcw size={16} />
            Limpiar búsqueda
          </button>
        </div>
      </div>

      {/* Resultados destinados a selección y asignación. */}
      {busquedaActiva && (
        <div className="filtros-resultados">
          <div className="filtros-resultados-header">
            <h2>Seleccionar reportes</h2>
            <span>{resultados.length} resultados</span>
          </div>

          {resultados.length > 0 && (
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <label>
                <input
                  type="checkbox"
                  className="resultado-checkbox"
                  checked={todosSeleccionados}
                  onChange={(e) =>
                    seleccionarTodos(e.target.checked)
                  }
                />{" "}
                Seleccionar todos los resultados
              </label>
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="resultados-vacio">
              No se encontraron reportes con esas condiciones.
            </div>
          ) : (
            resultados.map((reporte) => (
              <div
                className="resultado-reporte"
                key={reporte.folio}
              >
                <div className="resultado-principal">
                  <input
                    type="checkbox"
                    className="resultado-checkbox"
                    aria-label={`Seleccionar ${reporte.folio}`}
                    checked={seleccionados.includes(reporte.folio)}
                    onChange={(e) =>
                      seleccionar(reporte.folio, e.target.checked)
                    }
                  />

                  <div className="resultado-datos">
                    <strong>{reporte.folio}</strong>
                    <p>{reporte.descripcion || "Sin descripción"}</p>
                    <span>{reporte.direccion || "Sin ubicación"}</span>
                  </div>

                  <span className="resultado-estado">
                    {reporte.estado}
                  </span>
                </div>

                <div className="resultado-etiquetas">
                  {["Observación", ...TIPOS].flatMap((tipo) =>
                    valoresEtiqueta(reporte, tipo).map((valor) => (
                      <span key={`${tipo}-${valor}`}>
                        {tipo === "Categoria" ? "Categoría" : tipo}:{" "}
                        {valor}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))
          )}

          {seleccionados.length > 0 && (
            <div
              className="aplicar-etiqueta"
              style={{ margin: 16 }}
            >
              <div className="aplicar-etiqueta-info">
                <CheckSquare size={18} />
                {seleccionados.length} reporte(s) seleccionado(s)
              </div>

              <div className="aplicar-etiqueta-acciones">
                <select
                  aria-label="Tipo de etiqueta a aplicar"
                  value={tipoAplicar}
                  onChange={(e) => {
                    setTipoAplicar(e.target.value);
                    setNombreAplicar("");
                  }}
                >
                  <option value="">Selecciona tipo</option>
                  {TIPOS.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo === "Categoria" ? "Categoría" : tipo}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Etiqueta a aplicar"
                  value={nombreAplicar}
                  onChange={(e) => setNombreAplicar(e.target.value)}
                  disabled={!tipoAplicar}
                >
                  <option value="">Selecciona etiqueta</option>
                  {etiquetasAplicables.map((etiqueta) => (
                    <option
                      key={`${etiqueta.tipo}-${etiqueta.nombre_etiqueta}`}
                      value={etiqueta.nombre_etiqueta}
                    >
                      {etiqueta.nombre_etiqueta}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={aplicarEtiqueta}
                  disabled={
                    guardando || !tipoAplicar || !nombreAplicar
                  }
                >
                  Aplicar etiqueta
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Catálogo real de etiquetas. */}
      <div className="etiquetas-card">
        <div className="etiquetas-header">
          <div className="etiquetas-icono">
            <Tags size={20} />
          </div>

          <div>
            <h2>Administrar etiquetas</h2>
            <p>
              Crea y edita las etiquetas disponibles en SIPINNA.
            </p>
          </div>
        </div>

        <form className="crear-etiqueta" onSubmit={crearEtiqueta}>
          <select
            aria-label="Tipo de etiqueta nueva"
            value={tipoNuevo}
            onChange={(e) => setTipoNuevo(e.target.value)}
          >
            {TIPOS.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo === "Categoria" ? "Categoría" : tipo}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Nombre de la nueva etiqueta"
            maxLength={50}
            required
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
          />

          <button type="submit" disabled={guardando}>
            <Plus size={16} />
            Crear etiqueta
          </button>
        </form>

        <div className="etiquetas-disponibles">
          {catalogo.map((etiqueta) => (
            <div
              className="etiqueta-item"
              key={`${etiqueta.tipo}-${etiqueta.nombre_etiqueta}`}
            >
              <Tag size={15} />

              <span>
                {etiqueta.tipo === "Categoria"
                  ? "Categoría"
                  : etiqueta.tipo === "Observacion"
                    ? "Observación"
                    : etiqueta.tipo}
                : {etiqueta.nombre_etiqueta}
              </span>

              <strong>{contarEtiqueta(etiqueta)}</strong>

              {TIPOS.includes(etiqueta.tipo) && (
                <button
                  type="button"
                  onClick={() => editarEtiqueta(etiqueta)}
                  disabled={guardando}
                  title="Editar nombre"
                  aria-label={`Editar ${etiqueta.nombre_etiqueta}`}
                  style={{
                    display: "inline-flex",
                    border: 0,
                    background: "transparent",
                    color: "#6735c4",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {!catalogo.length && !cargando && (
          <p>No hay etiquetas disponibles en el catálogo.</p>
        )}
      </div>
    </div>
  );
}
