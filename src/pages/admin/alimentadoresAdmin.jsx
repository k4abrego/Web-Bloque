// Documentación automática de src/pages/admin/alimentadoresAdmin.jsx: Página y estilos de la sección alimentadoresAdmin.
import { useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Pencil,
  Power,
  X,
} from "lucide-react";
import alimentadoresMock from "../../mocks/alimentadores";
import reportesMock from "../../mocks/reportes";
import "./alimentadoresAdmin.css";


// Página donde el administrador puede gestionar las cuentas de alimentadores
// Sección: AlimentadoresAdmin.
function AlimentadoresAdmin() {

  // Guarda las cuentas para poder realizar cambios temporales
// Sección: declaración.
  const [alimentadores, setAlimentadores] = useState(alimentadoresMock);


  // Guarda la búsqueda y el filtro seleccionado
// Sección: declaración.
  const [busqueda, setBusqueda] = useState("");
// Sección: declaración.
  const [filtroEstado, setFiltroEstado] = useState("Todos");


  // Controla el formulario para crear o editar cuentas
// Sección: declaración.
  const [modalAbierto, setModalAbierto] = useState(false);
// Sección: declaración.
  const [cuentaEditando, setCuentaEditando] = useState(null);
// Sección: declaración.
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
  });
// Sección: declaración.
  const [errorFormulario, setErrorFormulario] = useState("");


  // Calcula la cantidad de cuentas registradas según su estado
// Sección: totalCuentas.
  const totalCuentas = alimentadores.length;

// Sección: cuentasActivas.
  const cuentasActivas = alimentadores.filter(
    (alimentador) => alimentador.estado === "Activo"
  ).length;

// Sección: cuentasInactivas.
  const cuentasInactivas = alimentadores.filter(
    (alimentador) => alimentador.estado === "Inactivo"
  ).length;


  // Filtra las cuentas según la búsqueda y el estado seleccionado
// Sección: alimentadoresFiltrados.
  const alimentadoresFiltrados = alimentadores.filter((alimentador) => {

// Sección: textoBusqueda.
    const textoBusqueda = busqueda.toLowerCase().trim();

// Sección: coincideBusqueda.
    const coincideBusqueda =
      alimentador.nombre.toLowerCase().includes(textoBusqueda) ||
      alimentador.correo.toLowerCase().includes(textoBusqueda) ||
      alimentador.alias.toLowerCase().includes(textoBusqueda);

// Sección: coincideEstado.
    const coincideEstado =
      filtroEstado === "Todos" ||
      alimentador.estado === filtroEstado;

    return coincideBusqueda && coincideEstado;
  });


  // Obtiene las iniciales para identificar visualmente a cada alimentador
// Sección: obtenerIniciales.
  const obtenerIniciales = (nombre) => {

    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((palabra) => palabra.charAt(0).toUpperCase())
      .join("");
  };


  // Calcula los reportes asignados a cada alimentador
// Sección: contarReportes.
  const contarReportes = (alias) => {

    return reportesMock.filter(
      (reporte) => reporte.alimentador === alias
    ).length;
  };


  // Abre el formulario para registrar una nueva cuenta
// Sección: abrirCrearCuenta.
  const abrirCrearCuenta = () => {

    setCuentaEditando(null);

    setFormulario({
      nombre: "",
      correo: "",
    });

    setErrorFormulario("");
    setModalAbierto(true);
  };


  // Abre el formulario con la información de una cuenta existente
// Sección: abrirEditarCuenta.
  const abrirEditarCuenta = (alimentador) => {

    setCuentaEditando(alimentador.id);

    setFormulario({
      nombre: alimentador.nombre,
      correo: alimentador.correo,
    });

    setErrorFormulario("");
    setModalAbierto(true);
  };


  // Cierra el formulario sin guardar cambios
// Sección: cerrarFormulario.
  const cerrarFormulario = () => {

    setModalAbierto(false);
    setCuentaEditando(null);
    setErrorFormulario("");
  };


  // Actualiza los campos del formulario
// Sección: actualizarFormulario.
  const actualizarFormulario = (campo, valor) => {

    setFormulario({
      ...formulario,
      [campo]: valor,
    });

    setErrorFormulario("");
  };


  // Guarda una cuenta nueva o los cambios de una cuenta existente
// Sección: guardarCuenta.
  const guardarCuenta = (e) => {

    e.preventDefault();

// Sección: nombre.
    const nombre = formulario.nombre.trim();
// Sección: correo.
    const correo = formulario.correo.trim().toLowerCase();


    // Comprueba que los campos tengan información
    if (!nombre || !correo) {

      setErrorFormulario("Completa todos los campos.");
      return;
    }


    // Evita registrar dos cuentas con el mismo correo
// Sección: correoExiste.
    const correoExiste = alimentadores.some(
      (alimentador) =>
        alimentador.correo.toLowerCase() === correo &&
        alimentador.id !== cuentaEditando
    );


    if (correoExiste) {

      setErrorFormulario("Ya existe una cuenta con este correo.");
      return;
    }


    // Actualiza la información si se está editando una cuenta
    if (cuentaEditando !== null) {

      setAlimentadores(
        alimentadores.map((alimentador) =>
          alimentador.id === cuentaEditando
            ? {
                ...alimentador,
                nombre,
                correo,
              }
            : alimentador
        )
      );

    } else {

      // Crea una cuenta temporal con un identificador nuevo
// Sección: nuevoId.
      const nuevoId =
        Math.max(0, ...alimentadores.map((alimentador) => alimentador.id)) + 1;

// Sección: nuevaCuenta.
      const nuevaCuenta = {
        id: nuevoId,
        nombre,
        correo,
        alias: `Alimentador ${String(nuevoId).padStart(2, "0")}`,
        estado: "Activo",
      };

      setAlimentadores([
        ...alimentadores,
        nuevaCuenta,
      ]);
    }


    cerrarFormulario();
  };


  // Permite activar o desactivar una cuenta temporalmente
// Sección: cambiarEstadoCuenta.
  const cambiarEstadoCuenta = (id) => {

    setAlimentadores(
      alimentadores.map((alimentador) =>
        alimentador.id === id
          ? {
              ...alimentador,
              estado:
                alimentador.estado === "Activo"
                  ? "Inactivo"
                  : "Activo",
            }
          : alimentador
      )
    );
  };


  return (
    <div className="alimentadores-admin">

      <div className="alimentadores-header">

        <div>
          <h1>Cuentas de alimentadores</h1>

          <p>
            Administra las cuentas del personal encargado
            del seguimiento de reportes.
          </p>
        </div>

        <button
          type="button"
          className="alimentadores-boton-nuevo"
          onClick={abrirCrearCuenta}
        >
          <Plus size={18} />
          Nueva cuenta
        </button>

      </div>


      <div className="alimentadores-resumen">

        <div className="alimentadores-resumen-card">

          <div className="alimentadores-resumen-icono total">
            <Users size={22} />
          </div>

          <div>
            <span>Total de cuentas</span>
            <strong>{totalCuentas}</strong>
          </div>

        </div>


        <div className="alimentadores-resumen-card">

          <div className="alimentadores-resumen-icono activas">
            <UserCheck size={22} />
          </div>

          <div>
            <span>Cuentas activas</span>
            <strong>{cuentasActivas}</strong>
          </div>

        </div>


        <div className="alimentadores-resumen-card">

          <div className="alimentadores-resumen-icono inactivas">
            <UserX size={22} />
          </div>

          <div>
            <span>Cuentas inactivas</span>
            <strong>{cuentasInactivas}</strong>
          </div>

        </div>

      </div>


      <div className="alimentadores-herramientas">

        <div className="alimentadores-buscador">

          <Search size={18} />

          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

        </div>


        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">
            Todas las cuentas
          </option>

          <option value="Activo">
            Activas
          </option>

          <option value="Inactivo">
            Inactivas
          </option>
        </select>

      </div>


      <div className="alimentadores-lista">

        <div className="alimentadores-lista-header">

          <h2>Personal alimentador</h2>

          <span>
            {alimentadoresFiltrados.length} de {totalCuentas} cuentas
          </span>

        </div>


        <div className="alimentadores-tabla-scroll">

          <table className="alimentadores-tabla">

            <thead>
              <tr>
                <th>Alimentador</th>
                <th>Correo electrónico</th>
                <th>Reportes asignados</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>


            <tbody>

              {alimentadoresFiltrados.length > 0 ? (

                alimentadoresFiltrados.map((alimentador) => (

                  <tr key={alimentador.id}>

                    <td>
                      <div className="alimentador-identidad">

                        <div className="alimentador-avatar">
                          {obtenerIniciales(alimentador.nombre)}
                        </div>

                        <div className="alimentador-nombre">

                          <strong>
                            {alimentador.nombre}
                          </strong>

                          <span>
                            {alimentador.alias}
                          </span>

                        </div>

                      </div>
                    </td>


                    <td>
                      <span className="alimentador-correo">
                        {alimentador.correo}
                      </span>
                    </td>


                    <td>
                      <span className="alimentador-reportes">
                        {contarReportes(alimentador.alias)}
                      </span>
                    </td>


                    <td>
                      <span
                        className={`alimentador-estado ${
                          alimentador.estado === "Activo"
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {alimentador.estado}
                      </span>
                    </td>


                    <td>
                      <div className="alimentador-acciones">

                        <button
                          type="button"
                          className="alimentador-accion-editar"
                          onClick={() => abrirEditarCuenta(alimentador)}
                        >
                          <Pencil size={15} />
                          Editar
                        </button>


                        <button
                          type="button"
                          className={`alimentador-accion-estado ${
                            alimentador.estado === "Activo"
                              ? "desactivar"
                              : "activar"
                          }`}
                          onClick={() => cambiarEstadoCuenta(alimentador.id)}
                        >
                          <Power size={15} />

                          {alimentador.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                        </button>

                      </div>
                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan={5}>

                    <div className="alimentadores-vacio">

                      <Users size={30} />

                      <strong>
                        No se encontraron cuentas
                      </strong>

                      <p>
                        Intenta cambiar la búsqueda o el filtro seleccionado.
                      </p>

                    </div>

                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      <p className="alimentadores-nota">
        Los cambios realizados son temporales y no modifican
        cuentas de acceso reales.
      </p>


      {modalAbierto && (

        <div className="alimentador-modal-fondo">

          <div
            className="alimentador-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="alimentador-modal-titulo"
          >

            <div className="alimentador-modal-header">

              <div>
                <h2 id="alimentador-modal-titulo">
                  {cuentaEditando !== null
                    ? "Editar cuenta"
                    : "Nueva cuenta"}
                </h2>

                <p>
                  {cuentaEditando !== null
                    ? "Modifica la información del alimentador."
                    : "Registra la información de un nuevo alimentador."}
                </p>
              </div>


              <button
                type="button"
                className="alimentador-modal-cerrar"
                onClick={cerrarFormulario}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>

            </div>


            <form onSubmit={guardarCuenta}>

              <div className="alimentador-formulario-campo">

                <label htmlFor="alimentador-nombre">
                  Nombre completo
                </label>

                <input
                  id="alimentador-nombre"
                  type="text"
                  placeholder="Ej. Ana Torres"
                  value={formulario.nombre}
                  onChange={(e) =>
                    actualizarFormulario("nombre", e.target.value)
                  }
                  required
                />

              </div>


              <div className="alimentador-formulario-campo">

                <label htmlFor="alimentador-correo">
                  Correo electrónico
                </label>

                <input
                  id="alimentador-correo"
                  type="email"
                  placeholder="Ej. usuario@example.com"
                  value={formulario.correo}
                  onChange={(e) =>
                    actualizarFormulario("correo", e.target.value)
                  }
                  required
                />

              </div>


              {errorFormulario && (

                <p className="alimentador-formulario-error">
                  {errorFormulario}
                </p>

              )}


              <div className="alimentador-modal-acciones">

                <button
                  type="button"
                  className="alimentador-boton-cancelar"
                  onClick={cerrarFormulario}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="alimentador-boton-guardar"
                >
                  {cuentaEditando !== null
                    ? "Guardar cambios"
                    : "Crear cuenta"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default AlimentadoresAdmin;