// Imports 
import reportesMock from "../../mocks/reportes";
import "./filtrosAdmin.css";
import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";





// Página donde el administrador puede realizar búsquedas avanzadas y gestionar etiquetas 
function FiltrosAdmin() {

  // Guarda las condiciones utilizadas dentro de la búsqueda avanzada 
  const [condiciones, setCondiciones] = useState([
    {
      id: 1,
      conector: "AND",
      campo: "",
      valor: "",
    },
  ]);


  // Guarda los resultados obtenidos después de realizar una búsqueda 
  const [resultados, setResultados] = useState(reportesMock);


  // Agrega una nueva condición a la búsqueda 
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
  const eliminarCondicion = () => {

    if (condiciones.length > 1) {
      setCondiciones(condiciones.slice(0, -1));
    }
  };


  // Actualiza la información de una condición 
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
  const obtenerOpciones = (campo) => {

    let opciones = [];


    // Reúne todas las etiquetas existentes 
    if (campo === "etiquetas") {

      opciones = reportesMock.flatMap(
        (reporte) => reporte.etiquetas
      );

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

      opciones = reportesMock.map(
        (reporte) => reporte[campo]
      );

    }


    // Elimina las opciones repetidas 
    return [...new Set(opciones)];
  };


  // Comprueba si un reporte cumple con una condición 
  const cumpleCondicion = (reporte, condicion) => {

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
  const realizarBusqueda = () => {

    const condicionesActivas = condiciones.filter(
      (condicion) =>
        condicion.campo !== "" &&
        condicion.valor.trim() !== ""
    );


    // Muestra todos los reportes si no existen condiciones completas 
    if (condicionesActivas.length === 0) {

      setResultados(reportesMock);

      return;
    }


    // Busca los reportes que cumplen con las condiciones seleccionadas 
    const reportesEncontrados = reportesMock.filter(
      (reporte) => {

        let resultado = cumpleCondicion(
          reporte,
          condicionesActivas[0]
        );


        // Combina las siguientes condiciones utilizando AND u OR 
        for (
          let i = 1;
          i < condicionesActivas.length;
          i++
        ) {

          const condicion = condicionesActivas[i];

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
  };


  // Restablece la búsqueda y vuelve a mostrar todos los reportes 
  const limpiarBusqueda = () => {

    setCondiciones([
      {
        id: 1,
        conector: "AND",
        campo: "",
        valor: "",
      },
    ]);

    setResultados(reportesMock);
  };


  return (
    <div className="filtros-admin">

      {/* Encabezado principal de la página */}
      <div className="filtros-header">

        <div>
          <h1>Filtros y etiquetas</h1>

          <p>
            Realiza búsquedas avanzadas y clasifica los reportes
            mediante etiquetas.
          </p>
        </div>

      </div>


      {/* Sección utilizada para construir búsquedas avanzadas */}
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


        {/* Muestra las condiciones utilizadas en la búsqueda */}
        <div className="condiciones-lista">

          {condiciones.map((condicion, index) => (

            <div
              key={condicion.id}
              className="condicion-fila"
            >

              {/* Permite seleccionar AND u OR a partir de la segunda condición */}
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


              {/* Permite seleccionar qué información se desea buscar */}
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


              {/* Cambia las opciones dependiendo del campo seleccionado */}
              <div className="condicion-valor">

                {!condicion.campo ? (

                  // Muestra un campo desactivado mientras no se seleccione qué buscar 
                  <input
                    type="text"
                    placeholder="Selecciona primero un campo"
                    disabled
                  />

                ) : condicion.campo === "folio" ? (

                  // Permite escribir el folio que se desea buscar 
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

                  // Muestra únicamente las opciones disponibles para ese campo 
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


        {/* Controles utilizados para modificar las condiciones */}
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


      {/* Muestra un resumen de los resultados encontrados */}
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


      {/* Muestra los reportes encontrados */}
      <div className="filtros-resultados">

        {resultados.length > 0 ? (

          resultados.slice(0, 5).map((reporte) => (

            <div
              key={reporte.id}
              className="resultado-reporte"
            >

              {/* Información principal del reporte */}
              <div className="resultado-principal">

                <strong>
                  {reporte.folio}
                </strong>

                <span>
                  {reporte.tipo}
                </span>

              </div>


              {/* Estado y prioridad del reporte */}
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

          // Muestra un mensaje cuando no existen resultados 
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

    </div>
  );
}


export default FiltrosAdmin;