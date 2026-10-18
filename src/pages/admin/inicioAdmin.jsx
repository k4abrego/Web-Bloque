/**
 * Inicio administrativo con datos reales de comms-api.
 * Incluye estadísticas, dos gráficas y reportes recientes.
 */

import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { RefreshCw } from "lucide-react";

import { obtenerHistoricoReportes } from "../../services/reportesApi";
import { obtenerTerritorios } from "../../services/territoriosApi";

import "./inicioAdmin.css";

const EN_PROCESO = new Set([
  "En revisión",
  "Asignado",
  "En investigación",
  "Canalizado a Procuraduría",
]);

const TERMINADOS = new Set(["Cerrado", "Descartado"]);

function fecha(valor) {
  return valor ? String(valor).slice(0, 10) : "Sin fecha";
}

function texto(valor) {
  return valor == null || String(valor).trim() === ""
    ? "No disponible"
    : String(valor);
}

function contarPor(items, obtenerClave) {
  const conteos = new Map();

  items.forEach((item) => {
    const clave = obtenerClave(item);
    conteos.set(clave, (conteos.get(clave) || 0) + 1);
  });

  return [...conteos]
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort(
      (a, b) =>
        b.cantidad - a.cantidad ||
        a.nombre.localeCompare(b.nombre, "es")
    );
}


/**
 * Gráfica de dona para representar la distribución
 * de reportes por estado con datos reales.
 */
function GraficaDona({ titulo, descripcion, datos, cargando }) {
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

    const inicio = total
      ? (anteriores / total) * 100
      : 0;

    const fin = total
      ? ((anteriores + dato.cantidad) / total) * 100
      : 0;

    return {
      ...dato,
      color: colores[indice % colores.length],
      inicio,
      fin,
    };
  });

  const gradiente = segmentos
    .map(
      (segmento) =>
        `${segmento.color} ${segmento.inicio}% ${segmento.fin}%`
    )
    .join(", ");

  return (
    <section className="inicio-grafica-card">
      <h2>{titulo}</h2>
      <p>{descripcion}</p>

      {cargando ? (
        <div className="inicio-grafica-vacia">
          Cargando información...
        </div>
      ) : total === 0 ? (
        <div className="inicio-grafica-vacia">
          Sin reportes para graficar
        </div>
      ) : (
        <div className="inicio-dona-contenido">
          <div
            className="inicio-dona"
            role="img"
            aria-label={`Distribución de ${total} reportes por estado`}
            style={{
              background: `conic-gradient(${gradiente})`,
            }}
          >
            <div className="inicio-dona-centro">
              <strong>{total}</strong>
              <span>Reportes</span>
            </div>
          </div>

          <div className="inicio-dona-leyenda">
            {segmentos.map((segmento) => (
              <div
                className="inicio-dona-leyenda-item"
                key={segmento.nombre}
              >
                <span
                  className="inicio-dona-color"
                  style={{ backgroundColor: segmento.color }}
                />

                <span>{segmento.nombre}</span>

                <strong>{segmento.cantidad}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


function GraficaColumnas({ titulo, descripcion, datos, cargando }) {
  const maximo = Math.max(1, ...datos.map((d) => d.cantidad));

  return (
    <section className="inicio-grafica-card">
      <h2>{titulo}</h2>
      <p>{descripcion}</p>

      {cargando ? (
        <div className="inicio-grafica-vacia">Cargando...</div>
      ) : datos.length === 0 ? (
        <div className="inicio-grafica-vacia">
          Sin datos disponibles
        </div>
      ) : (
        <div className="inicio-columnas">
          {datos.map((dato) => (
            <div className="inicio-columna-item" key={dato.nombre}>
              <strong>{dato.cantidad}</strong>
              <div className="inicio-columna-area">
                <div
                  className="inicio-columna"
                  style={{
                    height: `${(dato.cantidad / maximo) * 100}%`,
                  }}
                />
              </div>
              <span title={dato.nombre}>{dato.nombre}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}



export default function InicioAdmin() {
  const [reportes, setReportes] = useState([]);
  const [territorios, setTerritorios] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [errorTerritorios, setErrorTerritorios] = useState("");
  const [intento, setIntento] = useState(0);

  // Consultar reportes reales.
  useEffect(() => {
    let vigente = true;
    obtenerHistoricoReportes()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos)) {
          throw new Error(
            "El histórico no devolvió una lista de reportes."
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

  // Consultar nombres reales de territorios.
  useEffect(() => {
    let vigente = true;

    obtenerTerritorios()
      .then((datos) => {
        if (!vigente) return;

        if (!Array.isArray(datos?.territorios)) {
          throw new Error("Catálogo de territorios inválido.");
        }

        setTerritorios(datos.territorios);
        setErrorTerritorios("");
      })
      .catch(() => {
        if (vigente) {
          setErrorTerritorios(
            "No se pudieron obtener los nombres de territorios."
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

  const estadisticas = useMemo(
    () => ({
      total: reportes.length,
      nuevos: reportes.filter((r) => r.estado === "Nuevo" || r.estado === "Registrado").length,
      proceso: reportes.filter((r) =>
        EN_PROCESO.has(r.estado)
      ).length,
      terminados: reportes.filter((r) =>
        TERMINADOS.has(r.estado)
      ).length,
    }),
    [reportes]
  );

  const porEstado = useMemo(
    () => contarPor(reportes, (r) => texto(r.estado)),
    [reportes]
  );

  const porTerritorio = useMemo(
    () =>
      contarPor(reportes, (r) => {
        if (r.id_territorio == null) {
          return "Sin territorio";
        }

        return (
          nombres.get(String(r.id_territorio)) ||
          `Territorio ${r.id_territorio}`
        );
      }),
    [reportes, nombres]
  );

  const recientes = useMemo(
    () =>
      [...reportes]
        .sort((a, b) => {
          const aFecha = Date.parse(a.fecha_envio) || 0;
          const bFecha = Date.parse(b.fecha_envio) || 0;
          return bFecha - aFecha;
        })
        .slice(0, 5),
    [reportes]
  );

  function nombreTerritorio(id) {
    if (id == null) return "Sin territorio";

    return (
      nombres.get(String(id)) ||
      `Territorio ${id}`
    );
  }

  return (
    <div className="admin-inicio">
      <header className="admin-inicio-header inicio-encabezado-flex">
        <div>
          <h1>Panel de Administrador</h1>
          <p>
            Resumen de reportes registrados y disponibles
            para tu cuenta.
          </p>
        </div>

        <button
          className="inicio-boton-actualizar"
          type="button"
          disabled={cargando}
          onClick={() => setIntento((n) => n + 1)}
        >
          <RefreshCw size={16} />
          Actualizar
        </button>
      </header>

      {error && !cargando && (
        <div className="inicio-error" role="alert">
          No se pudo cargar el resumen: {error}

          <button
            type="button"
            onClick={() => setIntento((n) => n + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {errorTerritorios && (
        <p className="inicio-advertencia" role="alert">
          {errorTerritorios}
        </p>
      )}

      <div className="admin-resumen">
        {[
          ["Total de reportes", estadisticas.total],
          ["Nuevos", estadisticas.nuevos],
          ["En seguimiento", estadisticas.proceso],
          ["Finalizados", estadisticas.terminados],
        ].map(([etiqueta, valor]) => (
          <div className="resumen-card" key={etiqueta}>
            <h3>{etiqueta}</h3>
            <p>{cargando || error ? "—" : valor}</p>
          </div>
        ))}
      </div>

      <div className="inicio-graficas-grid">
        <GraficaDona
          titulo="Reportes por estado"
          descripcion="Distribución de los estados reales de los expedientes."
          datos={error ? [] : porEstado}
          cargando={cargando}
        />

        <GraficaColumnas
          titulo="Reportes por territorio"
          descripcion="Municipios con reportes registrados."
          datos={error ? [] : porTerritorio}
          cargando={cargando}
        />
      </div>

      <section className="reportes-recientes">
        <div className="reportes-recientes-header">
          <div>
            <h2>Reportes recientes</h2>
            <p>Ordenados por fecha de envío.</p>
          </div>

          <NavLink
            to="/admin/reportes"
            className="ver-reportes"
          >
            Ver todos los reportes
          </NavLink>
        </div>

        <div className="reportes-tabla-container">
          <table className="reportes-tabla">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Descripción</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Territorio</th>
                <th>ID alimentador</th>
              </tr>
            </thead>

            <tbody>
              {!cargando &&
                !error &&
                recientes.map((reporte) => (
                  <tr key={reporte.folio}>
                    <td>
                      <NavLink
                        className="reporte-folio"
                        to={`/admin/reportes/${encodeURIComponent(
                          reporte.folio
                        )}`}
                      >
                        {reporte.folio}
                      </NavLink>
                    </td>

                    <td>{texto(reporte.descripcion)}</td>
                    <td>{fecha(reporte.fecha_envio)}</td>

                    <td>
                      <span
                        className="estado-badge"
                        data-estado={reporte.estado}
                      >
                        {texto(reporte.estado)}
                      </span>
                    </td>

                    <td>
                      {nombreTerritorio(
                        reporte.id_territorio
                      )}
                    </td>

                    <td>
                      {reporte.id_alimentador ??
                        "Sin asignar"}
                    </td>
                  </tr>
                ))}

              {(cargando ||
                error ||
                recientes.length === 0) && (
                <tr>
                  <td
                    className="inicio-tabla-mensaje"
                    colSpan={6}
                  >
                    {cargando
                      ? "Cargando reportes..."
                      : error
                        ? "No es posible mostrar los reportes hasta que responda la API."
                        : "Aún no hay reportes registrados."}
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
