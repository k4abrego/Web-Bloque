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

import "./mapaCalorAdmin.css";

const CENTRO = { lat: 19.557, lng: -99.271 };

export default function MapaCalorAdmin() {
  const navigate = useNavigate();

  const [puntos, setPuntos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  const [estatus, setEstatus] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [mostrarCalor, setMostrarCalor] = useState(true);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorFiltros, setErrorFiltros] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    Promise.allSettled([
      apiFetch("/mapa/reportes"),
      obtenerHistoricoReportes(),
      obtenerTerritorios(),
    ]).then(([mapa, reportes, catalogo]) => {
      if (!vigente) return;

      if (
        mapa.status === "fulfilled" &&
        Array.isArray(mapa.value)
      ) {
        setPuntos(mapa.value);
        setError("");
      } else {
        setPuntos([]);
        setError("No se pudieron consultar los puntos del mapa.");
      }

      const historicoValido =
        reportes.status === "fulfilled" &&
        Array.isArray(reportes.value);

      const catalogoValido =
        catalogo.status === "fulfilled" &&
        Array.isArray(catalogo.value?.territorios);

      setHistorico(historicoValido ? reportes.value : []);
      setTerritorios(
        catalogoValido ? catalogo.value.territorios : []
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

  const reportesPorFolio = useMemo(
    () => new Map(historico.map((r) => [r.folio, r])),
    [historico]
  );

  const municipiosPorId = useMemo(
    () =>
      new Map(
        territorios.map((t) => [
          String(t.id_territorio),
          t.nombre,
        ])
      ),
    [territorios]
  );

  const puntosCompletos = useMemo(
    () =>
      puntos.map((p) => {
        const detalle = reportesPorFolio.get(p.folio);

        return {
          ...p,
          estatus: p.estatus ?? detalle?.estado ?? "",
          id_territorio:
            p.id_territorio ?? detalle?.id_territorio ?? null,
        };
      }),
    [puntos, reportesPorFolio]
  );

  const estadosDisponibles = useMemo(
    () =>
      [...new Set(
        puntosCompletos.map((p) => p.estatus).filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, "es")),
    [puntosCompletos]
  );

  const municipiosDisponibles = useMemo(
    () =>
      [...new Set(
        puntosCompletos
          .map((p) => p.id_territorio)
          .filter((id) => id != null)
          .map(String)
      )].sort((a, b) =>
        (municipiosPorId.get(a) || a).localeCompare(
          municipiosPorId.get(b) || b,
          "es"
        )
      ),
    [puntosCompletos, municipiosPorId]
  );

  const puntosFiltrados = useMemo(
    () =>
      puntosCompletos.filter((p) => {
        const coincideEstado =
          !estatus || p.estatus === estatus;

        const coincideMunicipio =
          !municipio ||
          String(p.id_territorio) === municipio;

        return coincideEstado && coincideMunicipio;
      }),
    [puntosCompletos, estatus, municipio]
  );

  function limpiarFiltros() {
    setEstatus("");
    setMunicipio("");
  }

  function actualizar() {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
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
            <label htmlFor="mapa-admin-estatus">Estatus</label>
            <select
              id="mapa-admin-estatus"
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
            >
              <option value="">Todos los estatus</option>
              {estadosDisponibles.map((e) => (
                <option value={e} key={e}>{e}</option>
              ))}
            </select>
          </div>

          <div className="mapa-calor-filtro">
            <label htmlFor="mapa-admin-municipio">Municipio</label>
            <select
              id="mapa-admin-municipio"
              value={municipio}
              onChange={(e) => setMunicipio(e.target.value)}
              disabled={municipiosDisponibles.length === 0}
            >
              <option value="">Todos los municipios</option>
              {municipiosDisponibles.map((id) => (
                <option key={id} value={id}>
                  {municipiosPorId.get(id) || `Municipio ${id}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorFiltros && (
          <p className="mapa-calor-mensaje">{errorFiltros}</p>
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
              navigate(`/admin/reportes/${encodeURIComponent(folio)}`)
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
