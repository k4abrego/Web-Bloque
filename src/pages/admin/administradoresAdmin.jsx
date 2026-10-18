/**
 * Página de gestión temporal de administradores.
 *
 * Permite crear, consultar, editar, filtrar y cambiar el estado
 * de cuentas simuladas, sin realizar peticiones al backend.
 */

import { useMemo, useState } from "react";
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

import "./administradoresAdmin.css";

/**
 * Catálogo temporal de instituciones.
 * Posteriormente se obtendrá desde MariaDB mediante el backend.
 */
const INSTITUCIONES = [
  {
    id: 2,
    nombre: "SIPINNA Atizapán de Zaragoza",
  },
];

/**
 * Catálogo temporal de municipios.
 * Cada cuenta puede tener múltiples municipios asignados.
 */
const MUNICIPIOS = [
  {
    id: 2,
    nombre: "Atizapán de Zaragoza",
    estado: "Estado de México",
  },
];

/**
 * Cuenta inicial de demostración.
 * No representa una consulta en tiempo real a la base de datos.
 */
const ADMINISTRADORES_INICIALES = [
  {
    id: 3,
    nombre: "Administrador",
    apellidos: "Principal",
    correo: "admin.prueba@sipinna.gob.mx",
    telefono: "",
    institucionId: 2,
    municipios: [2],
    estado: "Activo",
  },
];

/**
 * Devuelve un formulario con valores iniciales vacíos.
 *
 * @returns {object} Campos iniciales del formulario.
 */
function crearFormularioVacio() {
  return {
    nombre: "",
    apellidos: "",
    correo: "",
    telefono: "",
    institucionId: "",
    municipios: [],
  };
}

/**
 * Obtiene las iniciales de una persona.
 *
 * @param {string} nombre - Nombre de la persona.
 * @param {string} apellidos - Apellidos de la persona.
 * @returns {string} Iniciales para el avatar.
 */
function obtenerIniciales(nombre, apellidos) {
  return `${nombre} ${apellidos}`
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra.charAt(0).toUpperCase())
    .join("");
}

/**
 * Obtiene el nombre de una institución mediante su ID.
 *
 * @param {number|string} institucionId - ID de la institución.
 * @returns {string} Nombre de la institución.
 */
function obtenerInstitucion(institucionId) {
  const institucion = INSTITUCIONES.find(
    (item) => item.id === Number(institucionId)
  );

  return institucion?.nombre || "Sin asignar";
}

/**
 * Obtiene los nombres de los municipios asignados.
 *
 * @param {number[]} ids - IDs de los municipios.
 * @returns {string[]} Nombres de los municipios.
 */
function obtenerMunicipios(ids = []) {
  return ids.map((id) => {
    const municipio = MUNICIPIOS.find(
      (item) => item.id === Number(id)
    );

    return municipio?.nombre || `Municipio ${id}`;
  });
}

/**
 * AdministradoresAdmin
 *
 * Renderiza el panel temporal de cuentas de administradores.
 * Los cambios se almacenan exclusivamente en el estado de React.
 *
 * @returns {JSX.Element} Página de administradores.
 */
function AdministradoresAdmin() {
  // Registros temporales de la pantalla.
  const [administradores, setAdministradores] = useState(
    ADMINISTRADORES_INICIALES
  );

  // Estado del buscador y filtros.
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroMunicipio, setFiltroMunicipio] = useState("Todos");

  // Estado del formulario.
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaEditando, setCuentaEditando] = useState(null);
  const [formulario, setFormulario] = useState(
    crearFormularioVacio()
  );
  const [errorFormulario, setErrorFormulario] = useState("");

  /**
   * Calcula las estadísticas de las cuentas temporales.
   */
  const totalCuentas = administradores.length;

  const cuentasActivas = administradores.filter(
    (admin) => admin.estado === "Activo"
  ).length;

  const cuentasInactivas = administradores.filter(
    (admin) => admin.estado === "Inactivo"
  ).length;

  /**
   * Filtra los administradores por texto, estado y municipio.
   * Los tres filtros funcionan de manera simultánea.
   */
  const administradoresFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return administradores.filter((admin) => {
      const nombreCompleto =
        `${admin.nombre} ${admin.apellidos}`.toLowerCase();

      const coincideBusqueda =
        nombreCompleto.includes(texto) ||
        admin.correo.toLowerCase().includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" ||
        admin.estado === filtroEstado;

      const coincideMunicipio =
        filtroMunicipio === "Todos" ||
        (filtroMunicipio === "Sin asignar"
          ? admin.municipios.length === 0
          : admin.municipios.includes(Number(filtroMunicipio)));

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideMunicipio
      );
    });
  }, [administradores, busqueda, filtroEstado, filtroMunicipio]);

  /**
   * Abre el formulario para registrar una nueva cuenta temporal.
   */
  function abrirCrearCuenta() {
    setCuentaEditando(null);
    setFormulario(crearFormularioVacio());
    setErrorFormulario("");
    setModalAbierto(true);
  }

  /**
   * Abre el formulario con los datos de la cuenta seleccionada.
   *
   * @param {object} admin - Administrador que se editará.
   */
  function abrirEditarCuenta(admin) {
    setCuentaEditando(admin.id);

    setFormulario({
      nombre: admin.nombre,
      apellidos: admin.apellidos,
      correo: admin.correo,
      telefono: admin.telefono || "",
      institucionId: String(admin.institucionId || ""),
      municipios: [...admin.municipios],
    });

    setErrorFormulario("");
    setModalAbierto(true);
  }

  /**
   * Cierra el formulario y descarta los cambios pendientes.
   */
  function cerrarFormulario() {
    setModalAbierto(false);
    setCuentaEditando(null);
    setErrorFormulario("");
  }

  /**
   * Actualiza un campo del formulario.
   *
   * @param {string} campo - Nombre del campo.
   * @param {string|number[]} valor - Nuevo valor.
   */
  function actualizarFormulario(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setErrorFormulario("");
  }

  /**
   * Agrega o elimina un municipio de la selección múltiple.
   *
   * @param {number} municipioId - ID del municipio.
   */
  function cambiarMunicipio(municipioId) {
    setFormulario((anterior) => {
      const seleccionado =
        anterior.municipios.includes(municipioId);

      return {
        ...anterior,
        municipios: seleccionado
          ? anterior.municipios.filter(
              (id) => id !== municipioId
            )
          : [...anterior.municipios, municipioId],
      };
    });

    setErrorFormulario("");
  }

  /**
   * Valida y guarda una cuenta temporal.
   *
   * @param {React.FormEvent<HTMLFormElement>} evento
   */
  function guardarCuenta(evento) {
    evento.preventDefault();

    const nombre = formulario.nombre.trim();
    const apellidos = formulario.apellidos.trim();
    const correo = formulario.correo.trim().toLowerCase();
    const telefono = formulario.telefono.trim();
    const institucionId = Number(formulario.institucionId);

    // Valida los datos obligatorios.
    if (
      !nombre ||
      !apellidos ||
      !correo ||
      !institucionId ||
      formulario.municipios.length === 0
    ) {
      setErrorFormulario(
        "Completa los datos obligatorios y selecciona al menos un municipio."
      );
      return;
    }

    // El teléfono es opcional, pero debe cumplir el formato E.164.
    if (telefono && !/^\+[1-9]\d{7,14}$/.test(telefono)) {
      setErrorFormulario(
        "El teléfono debe tener formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    // Impide duplicar correos dentro de las cuentas temporales.
    const correoExiste = administradores.some(
      (admin) =>
        admin.correo.toLowerCase() === correo &&
        admin.id !== cuentaEditando
    );

    if (correoExiste) {
      setErrorFormulario(
        "Ya existe un administrador con ese correo."
      );
      return;
    }

    const datos = {
      nombre,
      apellidos,
      correo,
      telefono,
      institucionId,
      municipios: [...formulario.municipios],
    };

    if (cuentaEditando !== null) {
      // Edita una cuenta temporal existente.
      setAdministradores((anteriores) =>
        anteriores.map((admin) =>
          admin.id === cuentaEditando
            ? { ...admin, ...datos }
            : admin
        )
      );
    } else {
      // Genera un identificador exclusivo para la simulación.
      const nuevoId =
        Math.max(0, ...administradores.map((admin) => admin.id)) + 1;

      setAdministradores((anteriores) => [
        ...anteriores,
        {
          id: nuevoId,
          ...datos,
          estado: "Activo",
        },
      ]);
    }

    cerrarFormulario();
  }

  /**
   * Cambia temporalmente el estado de una cuenta.
   *
   * @param {number} id - Identificador del administrador.
   */
  function cambiarEstadoCuenta(id) {
    setAdministradores((anteriores) =>
      anteriores.map((admin) =>
        admin.id === id
          ? {
              ...admin,
              estado:
                admin.estado === "Activo"
                  ? "Inactivo"
                  : "Activo",
            }
          : admin
      )
    );
  }

  return (
    <div className="administradores-admin">

      {/* Encabezado de la página */}
      <div className="administradores-header">
        <div>
          <h1>Cuentas de administradores</h1>
          <p>
            Administra las cuentas y los municipios
            asignados al personal administrativo.
          </p>
        </div>

        <button
          type="button"
          className="administradores-boton-nuevo"
          onClick={abrirCrearCuenta}
        >
          <Plus size={18} />
          Nueva cuenta
        </button>
      </div>

      {/* Resumen de cuentas */}
      <div className="administradores-resumen">
        <div className="administradores-resumen-card">
          <div className="administradores-resumen-icono total">
            <Users size={22} />
          </div>
          <div>
            <span>Total de cuentas</span>
            <strong>{totalCuentas}</strong>
          </div>
        </div>

        <div className="administradores-resumen-card">
          <div className="administradores-resumen-icono activas">
            <UserCheck size={22} />
          </div>
          <div>
            <span>Cuentas activas</span>
            <strong>{cuentasActivas}</strong>
          </div>
        </div>

        <div className="administradores-resumen-card">
          <div className="administradores-resumen-icono inactivas">
            <UserX size={22} />
          </div>
          <div>
            <span>Cuentas inactivas</span>
            <strong>{cuentasInactivas}</strong>
          </div>
        </div>
      </div>

      {/* Herramientas de búsqueda y filtrado */}
      <div className="administradores-herramientas">

        <div className="administradores-buscador">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(evento.target.value)
            }
          />
        </div>

        <select
          aria-label="Filtrar cuentas por estado"
          value={filtroEstado}
          onChange={(evento) =>
            setFiltroEstado(evento.target.value)
          }
        >
          <option value="Todos">Todas las cuentas</option>
          <option value="Activo">Activas</option>
          <option value="Inactivo">Inactivas</option>
        </select>

        <select
          aria-label="Filtrar cuentas por municipio"
          value={filtroMunicipio}
          onChange={(evento) =>
            setFiltroMunicipio(evento.target.value)
          }
        >
          <option value="Todos">Todos los municipios</option>
          {MUNICIPIOS.map((municipio) => (
            <option
              key={municipio.id}
              value={municipio.id}
            >
              {municipio.nombre}
            </option>
          ))}
          <option value="Sin asignar">Sin asignar</option>
        </select>
      </div>

      {/* Tabla de administradores */}
      <div className="administradores-lista">

        <div className="administradores-lista-header">
          <h2>Personal administrador</h2>
          <span>
            {administradoresFiltrados.length} de {totalCuentas} cuentas
          </span>
        </div>

        <div className="administradores-tabla-scroll">
          <table className="administradores-tabla">
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Correo electrónico</th>
                <th>Institución</th>
                <th>Municipios</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {administradoresFiltrados.length > 0 ? (
                administradoresFiltrados.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <div className="administrador-identidad">
                        <div className="administrador-avatar">
                          {obtenerIniciales(
                            admin.nombre,
                            admin.apellidos
                          )}
                        </div>
                        <div className="administrador-nombre">
                          <strong>
                            {admin.nombre} {admin.apellidos}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td>{admin.correo}</td>

                    <td>
                      {obtenerInstitucion(admin.institucionId)}
                    </td>

                    <td>
                      <div className="administradores-municipios">
                        {admin.municipios.length > 0
                          ? obtenerMunicipios(admin.municipios).map(
                              (municipio) => (
                                <span
                                  className="administradores-municipio"
                                  key={municipio}
                                >
                                  {municipio}
                                </span>
                              )
                            )
                          : "Sin asignar"}
                      </div>
                    </td>

                    <td>
                      <span
                        className={`administrador-estado ${
                          admin.estado === "Activo"
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {admin.estado}
                      </span>
                    </td>

                    <td>
                      <div className="administrador-acciones">
                        <button
                          type="button"
                          className="administrador-accion-editar"
                          onClick={() => abrirEditarCuenta(admin)}
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={`administrador-accion-estado ${
                            admin.estado === "Activo"
                              ? "desactivar"
                              : "activar"
                          }`}
                          onClick={() =>
                            cambiarEstadoCuenta(admin.id)
                          }
                        >
                          <Power size={15} />
                          {admin.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="administradores-vacio">
                      <Users size={30} />
                      <strong>No se encontraron cuentas</strong>
                      <p>
                        Modifica la búsqueda o los filtros.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="administradores-nota">
        Los cambios son temporales y no modifican cuentas
        ni permisos reales.
      </p>

      {/* Modal de creación y edición */}
      {modalAbierto && (
        <div className="administrador-modal-fondo">
          <div
            className="administrador-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="administrador-modal-titulo"
          >
            <div className="administrador-modal-header">
              <div>
                <h2 id="administrador-modal-titulo">
                  {cuentaEditando !== null
                    ? "Editar administrador"
                    : "Nueva cuenta"}
                </h2>
                <p>
                  {cuentaEditando !== null
                    ? "Modifica la información del administrador."
                    : "Registra temporalmente un nuevo administrador."}
                </p>
              </div>

              <button
                type="button"
                className="administrador-modal-cerrar"
                onClick={cerrarFormulario}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardarCuenta}>

              <div className="administrador-formulario-campo">
                <label htmlFor="admin-nombre">Nombre</label>
                <input
                  id="admin-nombre"
                  type="text"
                  minLength={3}
                  maxLength={30}
                  value={formulario.nombre}
                  onChange={(evento) =>
                    actualizarFormulario(
                      "nombre",
                      evento.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="administrador-formulario-campo">
                <label htmlFor="admin-apellidos">Apellidos</label>
                <input
                  id="admin-apellidos"
                  type="text"
                  minLength={3}
                  maxLength={100}
                  value={formulario.apellidos}
                  onChange={(evento) =>
                    actualizarFormulario(
                      "apellidos",
                      evento.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="administrador-formulario-campo">
                <label htmlFor="admin-correo">
                  Correo electrónico
                </label>
                <input
                  id="admin-correo"
                  type="email"
                  value={formulario.correo}
                  onChange={(evento) =>
                    actualizarFormulario(
                      "correo",
                      evento.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="administrador-formulario-campo">
                <label htmlFor="admin-telefono">
                  Teléfono (opcional)
                </label>
                <input
                  id="admin-telefono"
                  type="tel"
                  placeholder="+525512345678"
                  value={formulario.telefono}
                  onChange={(evento) =>
                    actualizarFormulario(
                      "telefono",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="administrador-formulario-campo">
                <label htmlFor="admin-institucion">
                  Institución
                </label>
                <select
                  id="admin-institucion"
                  value={formulario.institucionId}
                  onChange={(evento) =>
                    actualizarFormulario(
                      "institucionId",
                      evento.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Selecciona una institución
                  </option>
                  {INSTITUCIONES.map((institucion) => (
                    <option
                      key={institucion.id}
                      value={institucion.id}
                    >
                      {institucion.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección múltiple de municipios */}
              <div className="administrador-formulario-campo">
                <label>
                  Municipios asignados
                </label>
                <div className="administrador-municipios-selector">
                  {MUNICIPIOS.map((municipio) => (
                    <label
                      className="administrador-municipio-opcion"
                      key={municipio.id}
                    >
                      <input
                        type="checkbox"
                        checked={formulario.municipios.includes(
                          municipio.id
                        )}
                        onChange={() =>
                          cambiarMunicipio(municipio.id)
                        }
                      />
                      <span>
                        {municipio.nombre}
                        <small>{municipio.estado}</small>
                      </span>
                    </label>
                  ))}
                </div>
                <small className="administrador-ayuda">
                  Puedes seleccionar varios municipios.
                </small>
              </div>

              {errorFormulario && (
                <p className="administrador-formulario-error">
                  {errorFormulario}
                </p>
              )}

              <div className="administrador-modal-acciones">
                <button
                  type="button"
                  className="administrador-boton-cancelar"
                  onClick={cerrarFormulario}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="administrador-boton-guardar"
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

export default AdministradoresAdmin;
