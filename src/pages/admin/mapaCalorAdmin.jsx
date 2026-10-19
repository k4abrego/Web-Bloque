/**
 * @file mapaCalorAdmin.jsx
 * @description Mapa de concentración de reportes para administradores.
 *
 * Utiliza datos reales de comms-api, el catálogo de territorios
 * y el catálogo completo de etiquetas de MariaDB.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  RotateCcw,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import { apiFetch } from "../../services/api";
import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";
import GoogleMap from "../mapa/googleMap";
import {
  coincideEtiquetas,
  opcionesEtiqueta,
} from "../../services/etiquetasReportes";

import "./mapaCalorAdmin.css";

const CENTRO = { lat: 19.557, lng: -99.271 };

const FILTROS_INICIALES = {
  Observación: "",
  Categoria: "",
  Riesgo: "",
  Prioridad: "",
};

/**
 * Normaliza nombres para comparar municipios equivalentes.
 * No modifica la información almacenada en MariaDB.
 *
 * @param {string} nombre
 * @returns {string}
 */
function claveMunicipio(nombre) {
  const normalizado = String(nombre ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\s+/g, " ");

  if (
    normalizado === "atizapan" ||
    normalizado === "atizapan de zaragoza"
  ) {
    return "atizapan de zaragoza";
  }

  return normalizado;
}

/**
 * Obtiene el nombre visible de un municipio.
 *
 * @param {string} nombre
 * @returns {string}
 */
function nombreMunicipio(nombre) {
  if (claveMunicipio(nombre) === "atizapan de zaragoza") {
    return "Atizapán de Zaragoza";
  }

  return String(nombre ?? "").trim();
}

/**
 * Obtiene etiquetas disponibles de un tipo.
 * Observación depende del histórico; las otras clasificaciones
 * se consultan también desde el catálogo administrativo.
 *
 * @param {Object[]} historico
 * @param {Object[]} catalogo
 * @param {string} tipo
 * @returns {string[]}
 */
function obtenerOpcionesEtiquetas(historico, catalogo, tipo) {
  const presentes = opcionesEtiqueta(historico, tipo);

  if (tipo === "Observación") {
    return presentes;
  }

  const registradas = catalogo
    .filter(
      (etiqueta) =>
        etiqueta.tipo === tipo &&
        etiqueta.es_activo
    )
    .map((etiqueta) => etiqueta.nombre_etiqueta);

  return [...new Set([...presentes, ...registradas])]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Mapa de concentración del administrador.
 *
 * @returns {import("react").JSX.Element}
 */
export default function MapaCalorAdmin() {
  const navigate = useNavigate();

  const [puntos, setPuntos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [territorios, setTerritorios] = useState([]);
  const [catalogoEtiquetas, setCatalogoEtiquetas] = useState([]);

  const [estatus, setEstatus] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [filtrosEtiquetas, setFiltrosEtiquetas] = useState(
    FILTROS_INICIALES
  );
  const [mostrarCalor, setMostrarCalor] = useState(true);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");
  const [intento, setIntento] = useState(0);

  /**
   * Consulta datos autorizados de los reportes, territorios
   * y etiquetas. No utiliza datos simulados.
   */
  useEffect(() => {
    let vigente = true;

    Promise.allSettled([
      apiFetch("/mapa/reportes"),
      obtenerHistoricoReportes(),
      obtenerTerritorios(),
      apiFetch("/etiquetas"),
    ]).then(([mapa, reportes, territoriosRespuesta, etiquetas]) => {
      if (!vigente) return;

      const mapaValido =
        mapa.status === "fulfilled" &&
        Array.isArray(mapa.value);

      const historicoValido =
        reportes.status === "fulfilled" &&
        Array.isArray(reportes.value);

      const territoriosValidos =
        territoriosRespuesta.status === "fulfilled" &&
        Array.isArray(territoriosRespuesta.value?.territorios);

      const etiquetasValidas =
        etiquetas.status === "fulfilled" &&
        Array.isArray(etiquetas.value);

      setPuntos(mapaValido ? mapa.value : []);
      setHistorico(historicoValido ? reportes.value : []);

      setTerritorios(
        territoriosValidos
          ? territoriosRespuesta.value.territorios
          : []
      );

      setCatalogoEtiquetas(
        etiquetasValidas ? etiquetas.value : []
      );

      setError(
        mapaValido
          ? ""
          : "No se pudieron consultar los puntos del mapa."
      );

      setErrorFiltros(
        historicoValido &&
        territoriosValidos &&
        etiquetasValidas
          ? ""
          : "Algunos filtros no están disponibles temporalmente."
      );

      setCargando(false);
    });

    return () => {
      vigente = false;
    };
  }, [intento]);

  /** Relaciona cada folio con su información histórica. */
  const reportesPorFolio = useMemo(
    () => new Map(historico.map((reporte) => [
      reporte.folio,
      reporte,
    ])),
    [historico]
  );

  /** Relaciona identificadores de territorio con nombres. */
  const municipiosPorId = useMemo(
    () =>
      new Map(
        territorios.map((territorio) => [
          String(territorio.id_territorio),
          String(territorio.nombre ?? ""),
        ])
      ),
    [territorios]
  );

  /**
   * Completa los puntos geográficos con estado y etiquetas
   * del histórico.
   */
  const puntosCompletos = useMemo(
    () =>
      puntos.map((punto) => {
        const detalle = reportesPorFolio.get(punto.folio);

        return {
          ...punto,
          estatus: punto.estatus ?? detalle?.estado ?? "",
          id_territorio:
            punto.id_territorio ??
            detalle?.id_territorio ??
            null,
          etiquetas: detalle?.etiquetas ?? [],
          peligro_inmediato:
            detalle?.peligro_inmediato ?? "",
        };
      }),
    [puntos, reportesPorFolio]
  );

  /** Estados realmente presentes en los reportes del mapa. */
  const estadosDisponibles = useMemo(
    () =>
      [...new Set(
        puntosCompletos
          .map((punto) => punto.estatus)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, "es")),
    [puntosCompletos]
  );

  /**
   * Construye un único municipio visible por nombre normalizado.
   * Conserva las asociaciones con todos sus IDs originales.
   */
  const municipiosDisponibles = useMemo(() => {
    const grupos = new Map();

    for (const punto of puntosCompletos) {
      if (punto.id_territorio == null) continue;

      const id = String(punto.id_territorio);
      const nombre = municipiosPorId.get(id);

      if (!nombre) continue;

      const clave = claveMunicipio(nombre);
      if (!clave) continue;

      if (!grupos.has(clave)) {
        grupos.set(clave, {
          clave,
          nombre: nombreMunicipio(nombre),
        });
      }
    }

    return [...grupos.values()].sort((a, b) =>
      a.nombre.localeCompare(b.nombre, "es")
    );
  }, [puntosCompletos, municipiosPorId]);

  /** Aplica los filtros al conjunto de puntos del mapa. */
  const puntosFiltrados = useMemo(
    () =>
      puntosCompletos.filter((punto) => {
        const coincideEstado =
          !estatus || punto.estatus === estatus;

        const nombre = municipiosPorId.get(
          String(punto.id_territorio)
        );

        const coincideMunicipio =
          !municipio ||
          (nombre && claveMunicipio(nombre) === municipio);

        return (
          coincideEstado &&
          coincideMunicipio &&
          coincideEtiquetas(punto, filtrosEtiquetas)
        );
      }),
    [
      puntosCompletos,
      estatus,
      municipio,
      municipiosPorId,
      filtrosEtiquetas,
    ]
  );

  /** Restablece todos los filtros. */
  function limpiarFiltros() {
    setEstatus("");
    setMunicipio("");
    setFiltrosEtiquetas({ ...FILTROS_INICIALES });
  }

  /** Vuelve a consultar la información del servidor. */
  function actualizar() {
    setCargando(true);
    setError("");
    setErrorFiltros("");
    setIntento((actual) => actual + 1);
  }

  return (
    <div className="mapa-calor-admin">
      <header className="mapa-calor-header">
        <h1>Mapa de concentración de reportes</h1>
        <p>
          Consulta la distribución geográfica de los expedientes
          autorizados y abre un reporte desde su marcador.
        </p>
      </header>

      <section className="mapa-calor-filtros">
        <div className="mapa-calor-filtros-header">
          <h2>Filtros del mapa</h2>

          <button
            type="button"
            className="mapa-calor-limpiar"
            onClick={limpiarFiltros}
          >
            <RotateCcw size={16} />
            Limpiar filtros
          </button>
        </div>

        <div className="mapa-calor-filtros-campos">
          <div className="mapa-calor-filtro">
            <label htmlFor="mapa-admin-estatus">
              Estatus
            </label>

            <select
              id="mapa-admin-estatus"
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
            >
              <option value="">Todos los estatus</option>
              {estadosDisponibles.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>

          <div className="mapa-calor-filtro">
            <label htmlFor="mapa-admin-municipio">
              Municipio
            </label>

            <select
              id="mapa-admin-municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={municipiosDisponibles.length === 0}
            >
              <option value="">Todos los municipios</option>

              {municipiosDisponibles.map((item) => (
                <option key={item.clave} value={item.clave}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          {Object.keys(filtrosEtiquetas).map((tipo) => (
            <div className="mapa-calor-filtro" key={tipo}>
              <label htmlFor={`mapa-admin-${tipo}`}>
                {tipo === "Categoria" ? "Categoría" : tipo}
              </label>

              <select
                id={`mapa-admin-${tipo}`}
                value={filtrosEtiquetas[tipo]}
                onChange={(e) =>
                  setFiltrosEtiquetas((anteriores) => ({
                    ...anteriores,
                    [tipo]: e.target.value,
                  }))
                }
              >
                <option value="">Todos</option>

                {obtenerOpcionesEtiquetas(
                  historico,
                  catalogoEtiquetas,
                  tipo
                ).map((valor) => (
                  <option key={valor} value={valor}>
                    {valor}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {errorFiltros && (
          <p className="mapa-calor-mensaje" role="alert">
            {errorFiltros}
          </p>
        )}
      </section>

      <section className="mapa-calor-card">
        <div className="mapa-calor-card-header">
          <div className="mapa-calor-card-titulo">
            <div className="mapa-calor-card-icono">
              <MapPin size={21} />
            </div>

            <div>
              <h2>Distribución geográfica</h2>
              <p>
                La concentración se calcula únicamente con los
                reportes que cumplen los filtros.
              </p>
            </div>
          </div>

          <div className="mapa-calor-contador">
            {puntosFiltrados.length} de {puntos.length} reportes
          </div>
        </div>

        <div className="sipinna-mapa-herramientas">
          <label>
            <input
              type="checkbox"
              checked={mostrarCalor}
              onChange={(e) => setMostrarCalor(e.target.checked)}
            />
            Mostrar concentración
          </label>

          <button
            type="button"
            onClick={actualizar}
            disabled={cargando}
          >
            <RefreshCw size={16} />
            {cargando ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {error && (
          <p className="mapa-calor-mensaje" role="alert">
            {error}
          </p>
        )}

        <div className="mapa-calor-visor">
          <GoogleMap
            center={CENTRO}
            zoom={12}
            reportes={puntosFiltrados}
            mostrarCalor={mostrarCalor}
            onSelect={(folio) =>
              navigate(
                `/admin/reportes/${encodeURIComponent(folio)}`
              )
            }
          />
        </div>

        <div className="mapa-calor-card-footer">
          <MapPin size={16} />
          <span>
            {cargando
              ? "Consultando reportes..."
              : puntosFiltrados.length === 0
                ? "No hay reportes geolocalizados para estos filtros."
                : "Haz clic en un marcador para abrir su expediente."}
          </span>
        </div>
      </section>

      <div className="mapa-calor-aviso">
        <ShieldCheck size={19} />
        <p>
          Visualización interna para personal autorizado.
          El mapa de calor representa concentración de reportes,
          no nivel de riesgo ni prioridad del caso.
        </p>
      </div>
    </div>
  );
}