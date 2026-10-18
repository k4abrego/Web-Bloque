/**
 * Inicio del alimentador.
 * Consulta reportes reales autorizados por comms-api.
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  ClipboardList,
  Clock3,
  LoaderCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";

import "./inicioAlim.css";

const PROCESO = new Set([
  "En revisión",
  "Asignado",
  "En investigación",
  "Canalizado a Procuraduría",
]);

const FINALIZADOS = new Set(["Cerrado", "Descartado"]);

function texto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

function fecha(valor) {
  return valor ? String(valor).slice(0, 10) : "Sin fecha";
}

function agrupar(reportes, obtenerClave) {
  const grupos = new Map();

  reportes.forEach((reporte) => {
    const nombre = obtenerClave(reporte);
    grupos.set(nombre, (grupos.get(nombre) || 0) + 1);
  });

  return [...grupos]
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort(
      (a, b) =>
        b.cantidad - a.cantidad ||
        a.nombre.localeCompare(b.nombre, "es")
    );
}

function Barras({ datos, cargando }) {
  const maximo = Math.max(
    1,
    ...datos.map((dato) => dato.cantidad)
  );

  if (cargando) {
    return (
      <div className="alim-chart-empty">
        Cargando información...
      </div>
    );
  }

  if (!datos.length) {
    return (
      <div className="alim-chart-empty">
        Sin reportes para graficar
      </div>
    );
  }

  return (
    <div className="alim-barras">
      {datos.map(({ nombre, cantidad }) => (
        <div className="alim-barra-fila" key={nombre}>
          <span title={nombre}>{nombre}</span>

          <div
            className="alim-barra-fondo"
            role="img"
            aria-label={`${nombre}: ${cantidad} reportes`}
          >
            <div
              style={{
                width: `${(cantidad / maximo) * 100}%`,
              }}
            />
          </div>

          <strong>{cantidad}</strong>
        </div>
      ))}
    </div>
  );
}



/**
 * Gráfica de dona con distribución real de reportes por estado.
 */
function GraficaDonaAlim({ datos, cargando }) {
  const total = datos.reduce(
    (suma, dato) => suma + dato.cantidad,
    0
  );

  const colores = [
    "#6735c4",
    "#a78bfa",
    "#4f46e5",
    "#06b6d4",
    "#f59e0b",
    "#10b981",
    "#ec4899",
    "#64748b",
  ];

  const segmentos = datos.map((dato, indice) => {
    const anteriores = datos
      .slice(0, indice)
      .reduce((suma, item) => suma + item.cantidad, 0);

    return {
      ...dato,
      color: colores[indice % colores.length],
      inicio: total ? (anteriores / total) * 100 : 0,
      fin: total
        ? ((anteriores + dato.cantidad) / total) * 100
        : 0,
    };
  });

  const gradiente = segmentos
    .map(
      (segmento) =>
        `${segmento.color} ${segmento.inicio}% ${segmento.fin}%`
    )
    .join(", ");

  if (cargando) {
    return (
      <div className="alim-chart-empty">
        Cargando información...
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="alim-chart-empty">
        Sin reportes para graficar
      </div>
    );
  }

  return (
    <div className="alim-dona-contenido">
      <div
        className="alim-dona"
        role="img"
        aria-label={`Distribución de ${total} reportes por estado`}
        style={{
          background: `conic-gradient(${gradiente})`,
        }}
      >
        <div className="alim-dona-centro">
          <strong>{total}</strong>
          <span>Reportes</span>
        </div>
      </div>

      <div className="alim-dona-leyenda">
        {segmentos.map((segmento) => (
          <div
            className="alim-dona-leyenda-item"
            key={segmento.nombre}
          >
            <span
              className="alim-dona-color"
              style={{ backgroundColor: segmento.color }}
            />
            <span>{segmento.nombre}</span>
            <strong>{segmento.cantidad}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function InicioAlim() {
  const [reportes, setReportes] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorTerritorios, setErrorTerritorios] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;
    obtenerHistoricoReportes()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos)) {
          throw new Error(
            "La API no devolvió una lista válida."
          );
        }

        setReportes(datos);
        setError("");
      })
      .catch((err) => {
        if (!vigente) return;

        setReportes([]);
        setError(
          err?.message ||
            "No se pudieron consultar los reportes."
        );
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  useEffect(() => {
    let vigente = true;

    obtenerTerritorios()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos?.territorios)) {
          throw new Error(
            "Catálogo de territorios inválido."
          );
        }

        setTerritorios(datos.territorios);
        setErrorTerritorios("");
      })
      .catch(() => {
        if (vigente) {
          setErrorTerritorios(
            "No fue posible consultar los territorios."
          );
        }
      });

    return () => {
      vigente = false;
    };
  }, []);

  const nombres = useMemo(
    () =>
      new Map(
        territorios.map((territorio) => [
          String(territorio.id_territorio),
          territorio.nombre,
        ])
      ),
    [territorios]
  );

  const resumen = useMemo(
    () => [
      {
        titulo: "Casos asignados",
        valor: reportes.length,
        icono: ClipboardList,
      },
      {
        titulo: "Nuevos",
        valor: reportes.filter(
          (reporte) => reporte.estado === "Nuevo" || reporte.estado === "Registrado"
        ).length,
        icono: Clock3,
      },
      {
        titulo: "En seguimiento",
        valor: reportes.filter((reporte) =>
          PROCESO.has(reporte.estado)
        ).length,
        icono: LoaderCircle,
      },
      {
        titulo: "Finalizados",
        valor: reportes.filter((reporte) =>
          FINALIZADOS.has(reporte.estado)
        ).length,
        icono: CheckCircle2,
      },
    ],
    [reportes]
  );

  const porTerritorio = useMemo(
    () =>
      agrupar(reportes, (reporte) => {
        if (reporte.id_territorio == null) {
          return "Sin territorio";
        }

        return (
          nombres.get(String(reporte.id_territorio)) ||
          `Territorio ${reporte.id_territorio}`
        );
      }),
    [reportes, nombres]
  );

  const porEstado = useMemo(
    () => agrupar(reportes, (reporte) => texto(reporte.estado)),
    [reportes]
  );

  const recientes = useMemo(
    () =>
      [...reportes]
        .sort(
          (a, b) =>
            (Date.parse(b.fecha_envio) || 0) -
            (Date.parse(a.fecha_envio) || 0)
        )
        .slice(0, 5),
    [reportes]
  );

  function nombreTerritorio(id) {
    if (id == null) {
      return "Sin territorio";
    }

    return (
      nombres.get(String(id)) ||
      `Territorio ${id}`
    );
  }

  return (
    <div className="inicio-alim">
      <header className="inicio-alim-header alim-cabecera">
        <div>
          <h1>Inicio</h1>
          <p>Resumen de los reportes asignados.</p>
        </div>

        <button
          type="button"
          className="alim-outline-button"
          disabled={cargando}
          onClick={() => {
            setCargando(true);
            setError("");
            setIntento((n) => n + 1);
            }}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      {error && !cargando && (
        <div className="alim-error" role="alert">
          No se pudo cargar el resumen: {error}

          <button
            type="button"
            onClick={() => {
                setCargando(true);
                setError("");
                setIntento((n) => n + 1);
                }}
          >
            Reintentar
          </button>
        </div>
      )}

      {errorTerritorios && (
        <p className="alim-error" role="alert">
          {errorTerritorios}
        </p>
      )}

      <section className="alim-stats">
        {resumen.map((item) => {
          const Icono = item.icono;

          return (
            <div
              className="alim-stat-card"
              key={item.titulo}
            >
              <div className="alim-stat-icon">
                <Icono size={24} />
              </div>

              <div className="alim-stat-content">
                <div className="alim-stat-title">
                  {item.titulo}
                </div>

                <div className="alim-stat-number">
                  {cargando || error ? "—" : item.valor}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="alim-charts">
        <div className="alim-chart-card">
          <div className="alim-chart-header">
            <h2>Reportes por territorio</h2>
            <p>
              Distribución de casos asignados por municipio.
            </p>
          </div>

          <GraficaDonaAlim
            datos={error ? [] : porTerritorio}
            cargando={cargando}
          />
        </div>

        <div className="alim-chart-card">
          <div className="alim-chart-header">
            <h2>Estado de los reportes</h2>
            <p>
              Distribución según el estado registrado.
            </p>
          </div>

          <Barras
            datos={error ? [] : porEstado}
            cargando={cargando}
          />
        </div>
      </section>

      <section className="alim-recent-card">
        <div className="alim-recent-header">
          <div>
            <h2>Reportes recientes</h2>
            <p>
              Últimos reportes asignados,
              ordenados por fecha de envío.
            </p>
          </div>

          <NavLink
            to="/alimentador/reportes"
            className="alim-outline-button"
          >
            Ver todos mis reportes
          </NavLink>
        </div>

        <div className="alim-table-wrapper">
          <table className="alim-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Descripción</th>
                <th>Territorio</th>
                <th>Estado</th>
                <th>Fecha de envío</th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                !error &&
                recientes.map((reporte) => (
                  <tr key={reporte.folio}>
                    <td>
                      <NavLink
                        to={`/alimentador/reportes/${encodeURIComponent(
                          reporte.folio
                        )}`}
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>

                    <td>{texto(reporte.descripcion)}</td>

                    <td>
                      {nombreTerritorio(
                        reporte.id_territorio
                      )}
                    </td>

                    <td>{texto(reporte.estado)}</td>

                    <td>{fecha(reporte.fecha_envio)}</td>
                  </tr>
                ))}

              {(cargando ||
                error ||
                recientes.length === 0) && (
                <tr>
                  <td colSpan={5}>
                    <div className="alim-table-empty">
                      {cargando
                        ? "Cargando reportes..."
                        : error
                          ? "No se pudieron consultar los reportes."
                          : "No hay reportes asignados."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
