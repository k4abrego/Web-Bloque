// Documentación automática de src/pages/admin/filtrosAdmin.jsx: Página y estilos de la sección filtrosAdmin.
import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
  Tags,
  Tag,
} from "lucide-react";
import reportesMock from "../../mocks/reportes";
import "./filtrosAdmin.css";


// Página donde el administrador puede realizar búsquedas avanzadas y gestionar etiquetas
// Sección: FiltrosAdmin.
function FiltrosAdmin() {

  // Guarda una copia temporal de los reportes para poder modificar sus etiquetas
// Sección: declaración.
  const [reportes, setReportes] = useState(reportesMock);


  // Guarda las condiciones utilizadas dentro de la búsqueda avanzada
// Sección: declaración.
  const [condiciones, setCondiciones] = useState([
    {
      id: 1,
      conector: "AND",
      campo: "",
      valor: "",
    },
  ]);


  // Guarda los resultados obtenidos después de realizar una búsqueda
// Sección: declaración.
  const [resultados, setResultados] = useState(reportesMock);


  // Guarda los reportes seleccionados para aplicar etiquetas
// Sección: declaración.
  const [reportesSeleccionados, setReportesSeleccionados] = useState([]);


  // Guarda las etiquetas disponibles dentro del sistema
// Sección: declaración.
  const [etiquetasDisponibles, setEtiquetasDisponibles] = useState(
    [
      ...new Set(
        reportesMock.flatMap(
          (reporte) => reporte.etiquetas
        )
      ),
    ]
  );


  // Guarda la etiqueta seleccionada para aplicarla a los reportes
// Sección: declaración.
  const [etiquetaSeleccionada, setEtiquetaSeleccionada] = useState("");


  // Guarda el nombre de una nueva etiqueta
// Sección: declaración.
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");


  // Agrega una nueva condición a la búsqueda
// Sección: agregarCondicion.
  const agregarCondicion = () => {

    setCondiciones([
      ...condiciones,
      {
        id: Date.now(),
        conector: "AND",
        campo: "",
        valor: "",
      },
    ]);
  };


  // Elimina la última condición agregada
// Sección: eliminarCondicion.
  const eliminarCondicion = () => {

    if (condiciones.length > 1) {
      setCondiciones(condiciones.slice(0, -1));
    }
  };


  // Actualiza la información de una condición
// Sección: actualizarCondicion.
  const actualizarCondicion = (id, propiedad, valor) => {

    setCondiciones(
      condiciones.map((condicion) =>
        condicion.id === id
          ? {
              ...condicion,
              [propiedad]: valor,
            }
          : condicion
      )
    );
  };


  // Cambia el campo seleccionado y limpia el valor anterior
// Sección: cambiarCampo.
  const cambiarCampo = (id, campo) => {

    setCondiciones(
      condiciones.map((condicion) =>
        condicion.id === id
          ? {
              ...condicion,
              campo: campo,
              valor: "",
            }
          : condicion
      )
    );
  };


  // Obtiene las opciones disponibles según el campo seleccionado
// Sección: obtenerOpciones.
  const obtenerOpciones = (campo) => {

// Sección: opciones.
    let opciones = [];


    // Utiliza las etiquetas que se encuentran disponibles
    if (campo === "etiquetas") {

      opciones = etiquetasDisponibles;

    }


    // Obtiene los valores existentes del campo seleccionado
    else if (
      [
        "tipo",
        "estado",
        "prioridad",
        "ubicacion",
        "alimentador",
      ].includes(campo)
    ) {

      opciones = reportes.map(
        (reporte) => reporte[campo]
      );

    }


    // Elimina las opciones repetidas
    return [...new Set(opciones)];
  };


  // Comprueba si un reporte cumple con una condición
// Sección: cumpleCondicion.
  const cumpleCondicion = (reporte, condicion) => {

// Sección: valorBusqueda.
    const valorBusqueda = condicion.valor
      .toLowerCase()
      .trim();


    // Ignora las condiciones que todavía están incompletas
    if (!condicion.campo || !valorBusqueda) {
      return true;
    }


    // Permite buscar una parte del folio
    if (condicion.campo === "folio") {

      return reporte.folio
        .toLowerCase()
        .includes(valorBusqueda);
    }


    // Comprueba las etiquetas relacionadas con el reporte
    if (condicion.campo === "etiquetas") {

      return reporte.etiquetas.some(
        (etiqueta) =>
          etiqueta.toLowerCase() === valorBusqueda
      );
    }


    // Compara el valor seleccionado con la información del reporte
    return String(reporte[condicion.campo])
      .toLowerCase() === valorBusqueda;
  };


  // Realiza la búsqueda combinando las condiciones con AND y OR
// Sección: realizarBusqueda.
  const realizarBusqueda = () => {

// Sección: condicionesActivas.
    const condicionesActivas = condiciones.filter(
      (condicion) =>
        condicion.campo !== "" &&
        condicion.valor.trim() !== ""
    );


    // Muestra todos los reportes si no existen condiciones completas
    if (condicionesActivas.length === 0) {

      setResultados(reportes);
      setReportesSeleccionados([]);

      return;
    }


    // Busca los reportes que cumplen con las condiciones seleccionadas
// Sección: reportesEncontrados.
    const reportesEncontrados = reportes.filter(
      (reporte) => {

// Sección: resultado.
        let resultado = cumpleCondicion(
          reporte,
          condicionesActivas[0]
        );


        // Combina las siguientes condiciones utilizando AND u OR
        for (
// Sección: i.
          let i = 1;
          i < condicionesActivas.length;
          i++
        ) {

// Sección: condicion.
          const condicion = condicionesActivas[i];

// Sección: coincide.
          const coincide = cumpleCondicion(
            reporte,
            condicion
          );


          if (condicion.conector === "AND") {

            resultado = resultado && coincide;

          } else {

            resultado = resultado || coincide;

          }
        }


        return resultado;
      }
    );


    setResultados(reportesEncontrados);
    setReportesSeleccionados([]);
  };


  // Restablece la búsqueda y vuelve a mostrar todos los reportes
// Sección: limpiarBusqueda.
  const limpiarBusqueda = () => {

    setCondiciones([
      {
        id: 1,
        conector: "AND",
        campo: "",
        valor: "",
      },
    ]);

    setResultados(reportes);
    setReportesSeleccionados([]);
  };


  // Selecciona o deselecciona un reporte de los resultados
// Sección: cambiarSeleccionReporte.
  const cambiarSeleccionReporte = (reporteId) => {

    if (reportesSeleccionados.includes(reporteId)) {

      setReportesSeleccionados(
        reportesSeleccionados.filter(
          (id) => id !== reporteId
        )
      );

    } else {

      setReportesSeleccionados([
        ...reportesSeleccionados,
        reporteId,
      ]);
    }
  };


  // Crea una nueva etiqueta disponible para utilizar
// Sección: crearEtiqueta.
  const crearEtiqueta = () => {

// Sección: nombreEtiqueta.
    const nombreEtiqueta = nuevaEtiqueta.trim();


    // Evita crear etiquetas vacías
    if (!nombreEtiqueta) {
      return;
    }


    // Evita crear etiquetas con el mismo nombre
// Sección: etiquetaExiste.
    const etiquetaExiste = etiquetasDisponibles.some(
      (etiqueta) =>
        etiqueta.toLowerCase() ===
        nombreEtiqueta.toLowerCase()
    );


    if (etiquetaExiste) {
      return;
    }


    setEtiquetasDisponibles([
      ...etiquetasDisponibles,
      nombreEtiqueta,
    ]);

    setNuevaEtiqueta("");
  };


  // Aplica una etiqueta a todos los reportes seleccionados
// Sección: aplicarEtiqueta.
  const aplicarEtiqueta = () => {

    if (
      !etiquetaSeleccionada ||
      reportesSeleccionados.length === 0
    ) {
      return;
    }


// Sección: reportesActualizados.
    const reportesActualizados = reportes.map(
      (reporte) => {

        if (
          !reportesSeleccionados.includes(reporte.id)
        ) {
          return reporte;
        }


        // Evita agregar dos veces la misma etiqueta
        if (
          reporte.etiquetas.includes(
            etiquetaSeleccionada
          )
        ) {
          return reporte;
        }


        return {
          ...reporte,
          etiquetas: [
            ...reporte.etiquetas,
            etiquetaSeleccionada,
          ],
        };
      }
    );


    setReportes(reportesActualizados);


    // Actualiza también los resultados que se encuentran visibles
    setResultados(
      resultados.map((resultado) => {

// Sección: reporteActualizado.
        const reporteActualizado =
          reportesActualizados.find(
            (reporte) =>
              reporte.id === resultado.id
          );

        return reporteActualizado || resultado;
      })
    );


    setReportesSeleccionados([]);
    setEtiquetaSeleccionada("");
  };


  // Calcula cuántos reportes utilizan cada etiqueta
// Sección: contarEtiqueta.
  const contarEtiqueta = (etiqueta) => {

    return reportes.filter(
      (reporte) =>
        reporte.etiquetas.includes(etiqueta)
    ).length;
  };


  return (
    <div className="filtros-admin">

      <div className="filtros-header">

        <div>
          <h1>Filtros y etiquetas</h1>

          <p>
            Realiza búsquedas avanzadas y clasifica los reportes
            mediante etiquetas.
          </p>
        </div>

      </div>


      <div className="busqueda-avanzada-card">

        <div className="busqueda-avanzada-header">

          <div className="busqueda-avanzada-icono">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <h2>Búsqueda avanzada</h2>

            <p>
              Combina diferentes condiciones para localizar
              reportes específicos.
            </p>
          </div>

        </div>


        <div className="condiciones-lista">

          {condiciones.map((condicion, index) => (

            <div
              key={condicion.id}
              className="condicion-fila"
            >

              <div className="condicion-conector">

                {index === 0 ? (

                  <span>Buscar</span>

                ) : (

                  <select
                    value={condicion.conector}
                    onChange={(e) =>
                      actualizarCondicion(
                        condicion.id,
                        "conector",
                        e.target.value
                      )
                    }
                  >
                    <option value="AND">
                      AND
                    </option>

                    <option value="OR">
                      OR
                    </option>
                  </select>

                )}

              </div>


              <select
                className="condicion-campo"
                value={condicion.campo}
                onChange={(e) =>
                  cambiarCampo(
                    condicion.id,
                    e.target.value
                  )
                }
              >
                <option value="">
                  ¿Qué quieres buscar?
                </option>

                <option value="folio">
                  Folio
                </option>

                <option value="tipo">
                  Tipo de reporte
                </option>

                <option value="estado">
                  Estado
                </option>

                <option value="prioridad">
                  Prioridad
                </option>

                <option value="ubicacion">
                  Ubicación
                </option>

                <option value="alimentador">
                  Alimentador
                </option>

                <option value="etiquetas">
                  Etiqueta
                </option>
              </select>


              <div className="condicion-valor">

                {!condicion.campo ? (

                  <input
                    type="text"
                    placeholder="Selecciona primero un campo"
                    disabled
                  />

                ) : condicion.campo === "folio" ? (

                  <input
                    type="text"
                    placeholder="Ej. REP-003"
                    value={condicion.valor}
                    onChange={(e) =>
                      actualizarCondicion(
                        condicion.id,
                        "valor",
                        e.target.value
                      )
                    }
                  />

                ) : (

                  <select
                    value={condicion.valor}
                    onChange={(e) =>
                      actualizarCondicion(
                        condicion.id,
                        "valor",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecciona una opción
                    </option>

                    {obtenerOpciones(
                      condicion.campo
                    ).map((opcion) => (

                      <option
                        key={opcion}
                        value={opcion}
                      >
                        {opcion}
                      </option>

                    ))}

                  </select>

                )}

              </div>

            </div>

          ))}

        </div>


        <div className="busqueda-controles">

          <div className="condiciones-acciones">

            <button
              type="button"
              onClick={agregarCondicion}
            >
              <Plus size={17} />

              Añadir condición
            </button>


            <button
              type="button"
              onClick={eliminarCondicion}
              disabled={condiciones.length === 1}
            >
              <Minus size={17} />

              Eliminar condición
            </button>

          </div>


          <div className="busqueda-acciones">

            <button
              type="button"
              className="boton-limpiar"
              onClick={limpiarBusqueda}
            >
              <RotateCcw size={16} />

              Borrar todo
            </button>


            <button
              type="button"
              className="boton-buscar"
              onClick={realizarBusqueda}
            >
              <Search size={17} />

              Buscar
            </button>

          </div>

        </div>

      </div>


      <div className="filtros-resultados-header">

        <div>
          <h2>Resultados</h2>

          <p>
            Se encontraron{" "}
            <strong>{resultados.length}</strong>{" "}
            reportes.
          </p>
        </div>

      </div>


      <div className="filtros-resultados">

        {resultados.length > 0 ? (

          resultados.slice(0, 5).map((reporte) => (

            <div
              key={reporte.id}
              className="resultado-reporte"
            >

              <input
                className="resultado-checkbox"
                type="checkbox"
                checked={reportesSeleccionados.includes(
                  reporte.id
                )}
                onChange={() =>
                  cambiarSeleccionReporte(
                    reporte.id
                  )
                }
              />


              <div className="resultado-principal">

                <strong>
                  {reporte.folio}
                </strong>

                <span>
                  {reporte.tipo}
                </span>

              </div>


              <div className="resultado-etiquetas">

                {reporte.etiquetas.map(
                  (etiqueta) => (

                    <span key={etiqueta}>
                      {etiqueta}
                    </span>

                  )
                )}

              </div>


              <div className="resultado-datos">

                <span
                  className="resultado-estado"
                  data-estado={reporte.estado}
                >
                  {reporte.estado}
                </span>

                <span>
                  Prioridad {reporte.prioridad}
                </span>

              </div>

            </div>

          ))

        ) : (

          <div className="resultados-vacio">

            <Search size={30} />

            <strong>
              No se encontraron reportes
            </strong>

            <p>
              Intenta modificar las condiciones de búsqueda.
            </p>

          </div>

        )}

      </div>


      {resultados.length > 0 && (

        <div className="aplicar-etiqueta">

          <div className="aplicar-etiqueta-info">

            <Tag size={19} />

            <span>
              <strong>
                {reportesSeleccionados.length}
              </strong>{" "}
              reportes seleccionados
            </span>

          </div>


          <div className="aplicar-etiqueta-acciones">

            <select
              value={etiquetaSeleccionada}
              onChange={(e) =>
                setEtiquetaSeleccionada(
                  e.target.value
                )
              }
            >
              <option value="">
                Selecciona una etiqueta
              </option>

              {etiquetasDisponibles.map(
                (etiqueta) => (

                  <option
                    key={etiqueta}
                    value={etiqueta}
                  >
                    {etiqueta}
                  </option>

                )
              )}

            </select>


            <button
              type="button"
              onClick={aplicarEtiqueta}
              disabled={
                reportesSeleccionados.length === 0 ||
                !etiquetaSeleccionada
              }
            >
              Aplicar etiqueta
            </button>

          </div>

        </div>

      )}


      <div className="etiquetas-card">

        <div className="etiquetas-header">

          <div className="etiquetas-icono">
            <Tags size={20} />
          </div>

          <div>
            <h2>Gestionar etiquetas</h2>

            <p>
              Crea etiquetas para clasificar y organizar
              los reportes.
            </p>
          </div>

        </div>


        <div className="crear-etiqueta">

          <input
            type="text"
            placeholder="Nombre de la nueva etiqueta..."
            value={nuevaEtiqueta}
            onChange={(e) =>
              setNuevaEtiqueta(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                crearEtiqueta();
              }
            }}
          />


          <button
            type="button"
            onClick={crearEtiqueta}
          >
            <Plus size={17} />

            Crear etiqueta
          </button>

        </div>


        <div className="etiquetas-disponibles">

          {etiquetasDisponibles.map(
            (etiqueta) => (

              <div
                key={etiqueta}
                className="etiqueta-item"
              >

                <Tag size={15} />

                <span>
                  {etiqueta}
                </span>

                <strong>
                  {contarEtiqueta(etiqueta)}
                </strong>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}


export default FiltrosAdmin;