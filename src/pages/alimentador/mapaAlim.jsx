/**
 * @file mapaAlim.jsx
 * @description Mapa de expedientes asignados al alimentador.
 *
 * Conserva la navegación por folio, el mapa de calor
 * y los filtros sobre los expedientes autorizados.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  RotateCcw,
  MapPin,
} from "lucide-react";

import { apiFetch } from "../../services/api";
import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";
import GoogleMap from "../mapa/googleMap";
import {
  coincideEtiquetas,
  opcionesEtiqueta,
} from "../../services/etiquetasReportes";

import "./mapaAlim.css";

const CENTRO = { lat: 19.557, lng: -99.271 };

const FILTROS_INICIALES = {
  Observación: "",
  Categoria: "",
  Riesgo: "",
  Prioridad: "",
};

/**
 * Identifica municipios equivalentes sin modificar MariaDB.
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
 * Obtiene la denominación que aparecerá en el selector.
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
 * Mapa de reportes para el rol Alimentador.
 *
 * @returns {import("react").JSX.Element}
 */
export default function MapaAlim() {
  const navigate = useNavigate();

  const [puntos, setPuntos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  const [estatus, setEstatus] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [filtrosEtiquetas, setFiltrosEtiquetas] = useState(
    FILTROS_INICIALES
  );
  const [mostrarCalor, setMostrarCalor] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");
  const [intento, setIntento] = useState(0);

  /**
   * Recupera los puntos y el histórico autorizados
   * para el usuario autenticado.
   */
  useEffect(() => {
    let vigente = true;

    Promise.allSettled([
      apiFetch("/mapa/reportes"),
      obtenerHistoricoReportes(),
      obtenerTerritorios(),
    ]).then(([mapa, reportes, catalogo]) => {
      if (!vigente) return;

      const mapaValido =
        mapa.status === "fulfilled" &&
        Array.isArray(mapa.value);

      const historicoValido =
        reportes.status === "fulfilled" &&
        Array.isArray(reportes.value);

      const catalogoValido =
        catalogo.status === "fulfilled" &&
        Array.isArray(catalogo.value?.territorios);

      setPuntos(mapaValido ? mapa.value : []);
      setHistorico(historicoValido ? reportes.value : []);

      setTerritorios(
        catalogoValido ? catalogo.value.territorios : []
      );

      setError(
        mapaValido
          ? ""
          : "No se pudieron consultar tus casos geolocalizados."
      );

      setErrorFiltros(
        historicoValido && catalogoValido
          ? ""
          : "Algunos filtros no están disponibles temporalmente."
      );

      setCargando(false);
    });

    return () => {
      vigente = false;
    };
  }, [intento]);

  /** Relaciona cada folio con su reporte histórico. */
  const datosPorFolio = useMemo(
    () =>
      new Map(
        historico.map((reporte) => [
          reporte.folio,
          reporte,
        ])
      ),
    [historico]
  );

  /** Relaciona los IDs de territorio con sus nombres. */
  const nombresMunicipios = useMemo(
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
   * Combina datos del mapa con el histórico para poder
   * aplicar los filtros de etiquetas.
   */
  const puntosCompletos = useMemo(
    () =>
      puntos.map((punto) => {
        const detalle = datosPorFolio.get(punto.folio);

        return {
          ...punto,
          estatus:
            punto.estatus ?? detalle?.estado ?? "",
          id_territorio:
            punto.id_territorio ??
            detalle?.id_territorio ??
            null,
          etiquetas: detalle?.etiquetas ?? [],
          peligro_inmediato:
            detalle?.peligro_inmediato ?? "",
        };
      }),
    [puntos, datosPorFolio]
  );

  /** Obtiene los estados presentes en los casos asignados. */
  const estados = useMemo(
    () =>
      [...new Set(
        puntosCompletos
          .map((punto) => punto.estatus)
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, "es")),
    [puntosCompletos]
  );

  /**
   * Evita municipios duplicados por abreviaturas.
   * Los valores internos siguen correspondiendo a la
   * agrupación de los IDs originales.
   */
  const municipios = useMemo(() => {
    const grupos = new Map();

    for (const punto of puntosCompletos) {
      if (punto.id_territorio == null) continue;

      const id = String(punto.id_territorio);
      const nombre = nombresMunicipios.get(id);

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
  }, [puntosCompletos, nombresMunicipios]);

  /** Filtra únicamente los reportes autorizados del alimentador. */
  const visibles = useMemo(
    () =>
      puntosCompletos.filter((punto) => {
        const coincideEstado =
          !estatus || punto.estatus === estatus;

        const nombre = nombresMunicipios.get(
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
      nombresMunicipios,
      filtrosEtiquetas,
    ]
  );

  /** Limpia todos los filtros del mapa. */
  function limpiarFiltros() {
    setEstatus("");
    setMunicipio("");
    setFiltrosEtiquetas({ ...FILTROS_INICIALES });
  }

  /** Solicita los datos más recientes al servidor. */
  function actualizar() {
    setCargando(true);
    setError("");
    setErrorFiltros("");
    setIntento((actual) => actual + 1);
  }

  return (
    <div className="mapa-alim">
      <header className="mapa-alim-header">
        <h1>Mapa de reportes asignados</h1>
        <p>
          Ubica tus expedientes, aplica filtros y selecciona
          un marcador para consultar el caso.
        </p>
      </header>

      <section className="mapa-alim-card">
        <div className="sipinna-mapa-panel-filtros">
          <div className="sipinna-mapa-filtros">
            <div>
              <label htmlFor="mapa-alim-estatus">
                Estatus
              </label>
              <select
                id="mapa-alim-estatus"
                value={estatus}
                onChange={(e) => setEstatus(e.target.value)}
              >
                <option value="">Todos los estatus</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mapa-alim-municipio">
                Municipio
              </label>
              <select
                id="mapa-alim-municipio"
                value={municipio}
                disabled={municipios.length === 0}
                onChange={(e) => setMunicipio(e.target.value)}
              >
                <option value="">Todos los municipios</option>

                {municipios.map((item) => (
                  <option key={item.clave} value={item.clave}>
                    {item.nombre}
                  </option>
                ))}
              </select>
            </div>

            {Object.keys(filtrosEtiquetas).map((tipo) => (
              <div key={tipo}>
                <label htmlFor={`mapa-alim-${tipo}`}>
                  {tipo === "Categoria" ? "Categoría" : tipo}
                </label>

                <select
                  id={`mapa-alim-${tipo}`}
                  value={filtrosEtiquetas[tipo]}
                  onChange={(e) =>
                    setFiltrosEtiquetas((anteriores) => ({
                      ...anteriores,
                      [tipo]: e.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>

                  {opcionesEtiqueta(historico, tipo).map(
                    (valor) => (
                      <option key={valor} value={valor}>
                        {valor}
                      </option>
                    )
                  )}
                </select>
              </div>
            ))}
          </div>

          <div className="sipinna-mapa-acciones">
            <button
              type="button"
              onClick={limpiarFiltros}
            >
              <RotateCcw size={16} />
              Limpiar
            </button>

            <button
              type="button"
              onClick={actualizar}
              disabled={cargando}
            >
              <RefreshCw size={16} />
              Actualizar
            </button>
          </div>
        </div>

        <div className="sipinna-mapa-contador">
          <MapPin size={16} />
          {visibles.length} de {puntos.length} reportes visibles
        </div>

        {error && (
          <p className="sipinna-mapa-error" role="alert">
            {error}
          </p>
        )}

        {errorFiltros && (
          <p className="sipinna-mapa-error" role="alert">
            {errorFiltros}
          </p>
        )}

        <div className="sipinna-mapa-herramientas">
          <label>
            <input
              type="checkbox"
              checked={mostrarCalor}
              onChange={(e) => setMostrarCalor(e.target.checked)}
            />
            Mostrar concentración
          </label>
        </div>

        <div className="mapa-alim-map">
          <GoogleMap
            center={CENTRO}
            mostrarCalor={mostrarCalor}
            zoom={13}
            reportes={visibles}
            onSelect={(folio) =>
              navigate(
                `/alimentador/reportes/${encodeURIComponent(folio)}`
              )
            }
          />
        </div>

        <div className="sipinna-mapa-instruccion">
          {cargando
            ? "Consultando reportes..."
            : visibles.length === 0
              ? "No hay reportes geolocalizados para estos filtros."
              : "Selecciona un marcador para abrir el detalle del reporte."}
        </div>
      </section>
    </div>
  );
}