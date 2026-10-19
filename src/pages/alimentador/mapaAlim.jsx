import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, RotateCcw, MapPin } from "lucide-react";

import { apiFetch } from "../../services/api";
import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";
import GoogleMap from "../mapa/googleMap";

import "./mapaAlim.css";

const CENTRO = { lat: 19.557, lng: -99.271 };

export default function MapaAlim() {
  const navigate = useNavigate();

  const [puntos, setPuntos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  const [estatus, setEstatus] = useState("");
  const [municipio, setMunicipio] = useState("");
  const [mostrarCalor, setMostrarCalor] = useState(false);

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
        setError("No se pudieron consultar tus casos geolocalizados.");
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

  const datosPorFolio = useMemo(
    () => new Map(historico.map((r) => [r.folio, r])),
    [historico]
  );

  const nombresMunicipios = useMemo(
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
        const detalle = datosPorFolio.get(p.folio);

        return {
          ...p,
          estatus: p.estatus ?? detalle?.estado ?? "",
          id_territorio:
            p.id_territorio ?? detalle?.id_territorio ?? null,
        };
      }),
    [puntos, datosPorFolio]
  );

  const estados = useMemo(
    () =>
      [...new Set(
        puntosCompletos.map((p) => p.estatus).filter(Boolean)
      )].sort((a, b) => a.localeCompare(b, "es")),
    [puntosCompletos]
  );

  const municipios = useMemo(
    () =>
      [...new Set(
        puntosCompletos
          .map((p) => p.id_territorio)
          .filter((id) => id != null)
          .map(String)
      )].sort((a, b) =>
        (nombresMunicipios.get(a) || a).localeCompare(
          nombresMunicipios.get(b) || b,
          "es"
        )
      ),
    [puntosCompletos, nombresMunicipios]
  );

  const visibles = useMemo(
    () =>
      puntosCompletos.filter(
        (p) =>
          (!estatus || p.estatus === estatus) &&
          (!municipio || String(p.id_territorio) === municipio)
      ),
    [puntosCompletos, estatus, municipio]
  );

  function actualizar() {
    setCargando(true);
    setError("");
    setIntento((n) => n + 1);
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
              <label htmlFor="mapa-alim-estatus">Estatus</label>
              <select
                id="mapa-alim-estatus"
                value={estatus}
                onChange={(e) => setEstatus(e.target.value)}
              >
                <option value="">Todos los estatus</option>
                {estados.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="mapa-alim-municipio">Municipio</label>
              <select
                id="mapa-alim-municipio"
                value={municipio}
                disabled={municipios.length === 0}
                onChange={(e) => setMunicipio(e.target.value)}
              >
                <option value="">Todos los municipios</option>
                {municipios.map((id) => (
                  <option key={id} value={id}>
                    {nombresMunicipios.get(id) || `Municipio ${id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sipinna-mapa-acciones">
            <button
              type="button"
              onClick={() => {
                setEstatus("");
                setMunicipio("");
              }}
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