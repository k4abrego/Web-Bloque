/**
 * @file gestionCuentas.jsx
 * @description Gestión de cuentas institucionales de SIPINNA.
 *
 * Funcionalidades para alimentadores:
 * - Consultar cuentas recuperadas desde MariaDB.
 * - Buscar y filtrar por estado e institución.
 * - Crear alimentadores mediante auth-backend.
 * - Editar datos personales e institución.
 * - Desactivar y reactivar cuentas institucionales.
 * - Solicitar una nueva consulta después de guardar.
 *
 * Las operaciones se confirman desde el backend.
 * No se generan IDs ni cuentas ficticias en React.
 *
 * La autorización efectiva corresponde a auth-backend.
 */

import { useEffect, useMemo, useState } from "react";

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

import { apiFetch } from "../../services/api";

import {
  registrarAlimentador,
  editarAlimentador,
  cambiarEstadoAlimentador,
} from "../../services/cuentasInstitucionalesApi";

import "./alimentadoresAdmin.css";

/**
 * Estructura inicial del formulario de cuentas.
 *
 * La contraseña se utiliza exclusivamente durante
 * la creación de un alimentador.
 */
const FORMULARIO_VACIO = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  institucionId: "",
  password: "",
};

/**
 * Devuelve las iniciales de un nombre.
 *
 * @param {string} nombre - Nombre completo.
 * @returns {string} Iniciales en mayúsculas.
 */
function obtenerIniciales(nombre) {
  return String(nombre || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

/**
 * Valida un teléfono internacional E.164.
 *
 * @param {string} telefono - Teléfono proporcionado.
 * @returns {boolean} Indica si el teléfono es válido.
 */
function validarTelefono(telefono) {
  if (!telefono) return true;
  return /^\+[1-9]\d{7,14}$/.test(telefono);
}

/**
 * Consulta las instituciones reales de SIPINNA.
 *
 * @returns {Promise<Array<Object>>} Lista institucional.
 * @throws {Error} Cuando la respuesta no es válida.
 */
async function consultarInstituciones() {
  const respuesta = await apiFetch("/instituciones");

  if (!Array.isArray(respuesta)) {
    throw new Error(
      "El servidor no devolvió instituciones válidas."
    );
  }

  return respuesta.filter(
    (item) =>
      item?.id_institucion != null &&
      item?.nombre
  );
}

/**
 * GestionCuentas
 *
 * Componente reutilizable de administración institucional.
 *
 * Las cuentas llegan desde el componente padre y proceden
 * de una consulta real al backend.
 *
 * @param {Object} props - Propiedades.
 * @param {"alimentador"|"administrador"} props.tipo
 * Tipo de cuenta.
 * @param {Array<Object>} [props.inicialesCuentas=[]]
 * Cuentas obtenidas por el componente padre.
 * @param {Function} [props.onCuentaCreada]
 * Solicita recargar la lista después de una operación.
 *
 * @returns {import("react").JSX.Element}
 * Panel de gestión de cuentas.
 */
export default function GestionCuentas({
  tipo,
  inicialesCuentas = [],
  onCuentaCreada,
}) {
  const esAlimentador = tipo === "alimentador";

  const titulo = esAlimentador
    ? "alimentadores"
    : "administradores";

  // Las cuentas proceden del backend.
  const cuentas = inicialesCuentas;

  // Catálogo real de instituciones.
  const [instituciones, setInstituciones] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] =
    useState(true);
  const [errorCatalogos, setErrorCatalogos] =
    useState("");
  const [revisionCatalogos, setRevisionCatalogos] =
    useState(0);

  // Filtros de la tabla.
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [institucion, setInstitucion] =
    useState("Todas");

  // Formulario de creación y edición.
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formulario, setFormulario] = useState({
    ...FORMULARIO_VACIO,
  });

  // Estados de las operaciones.
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  /**
   * Obtiene el catálogo al montar el componente
   * o cuando se solicita reintentar.
   *
   * Ignora respuestas tardías después del desmontaje.
   */
  useEffect(() => {
    let vigente = true;

    consultarInstituciones()
      .then((datos) => {
        if (!vigente) return;

        setInstituciones(datos);
        setErrorCatalogos("");
      })
      .catch((err) => {
        if (!vigente) return;

        setErrorCatalogos(
          err.message ||
            "No fue posible consultar las instituciones."
        );
      })
      .finally(() => {
        if (vigente) {
          setCargandoCatalogos(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [revisionCatalogos]);

  /**
   * Obtiene las instituciones visibles para filtrar.
   */
  const nombresInstituciones = useMemo(() => {
    return Array.from(
      new Set(
        cuentas
          .map((cuenta) => cuenta.institucion)
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es"));
  }, [cuentas]);

  /**
   * Filtra las cuentas sin modificar los registros reales.
   */
  const cuentasFiltradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      const texto = [
        cuenta.nombre,
        cuenta.apellidos,
        cuenta.correo,
        cuenta.alias,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda = texto.includes(
        busqueda.trim().toLocaleLowerCase("es")
      );

      const coincideEstado =
        estado === "Todos" ||
        cuenta.estado === estado;

      const coincideInstitucion =
        institucion === "Todas" ||
        cuenta.institucion === institucion;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideInstitucion
      );
    });
  }, [cuentas, busqueda, estado, institucion]);

  const totalCuentas = cuentas.length;

  const cuentasActivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Activo"
  ).length;

  const cuentasInactivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Inactivo"
  ).length;

  /**
   * Solicita al padre recuperar nuevamente las cuentas
   * desde MariaDB.
   *
   * @returns {Promise<void>}
   */
  async function recargarCuentas() {
    if (typeof onCuentaCreada === "function") {
      await onCuentaCreada();
    }
  }

  /**
   * Abre el formulario para registrar una cuenta.
   */
  function abrirCreacion() {
    if (!esAlimentador) return;

    setEditando(null);
    setFormulario({ ...FORMULARIO_VACIO });

    setError("");
    setAviso("");
    setAbierto(true);
  }

  /**
   * Abre el formulario con los datos existentes.
   *
   * Utiliza el ID institucional cuando está disponible
   * y, como respaldo, busca el nombre en el catálogo.
   *
   * @param {Object} cuenta - Cuenta seleccionada.
   */
  function abrirEdicion(cuenta) {
    if (!esAlimentador) return;

    const seleccionada = instituciones.find(
      (item) =>
        Number(item.id_institucion) ===
          Number(cuenta.id_institucion) ||
        item.nombre === cuenta.institucion
    );

    setEditando(cuenta);

    setFormulario({
      nombre: cuenta.nombre || "",
      apellidos: cuenta.apellidos || "",
      correo: cuenta.correo || "",
      telefono: cuenta.telefono || "",
      institucionId: seleccionada
        ? String(seleccionada.id_institucion)
        : "",
      password: "",
    });

    setError("");
    setAviso("");
    setAbierto(true);
  }

  /**
   * Cierra el formulario si no hay una operación en curso.
   */
  function cerrar() {
    if (guardando) return;

    setAbierto(false);
    setEditando(null);
    setError("");
  }

  /**
   * Actualiza un campo del formulario.
   *
   * @param {string} campo - Nombre del campo.
   * @param {string} valor - Nuevo valor.
   */
  function cambiar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setError("");
  }

  /**
   * Valida y guarda la creación o edición.
   *
   * En creación:
   * POST /register/feeder/:adminId
   *
   * En edición:
   * PATCH /admin/alimentadores/:id
   *
   * La lista no se modifica manualmente.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} evento
   * @returns {Promise<void>}
   */
  async function guardar(evento) {
    evento.preventDefault();

    if (guardando || !esAlimentador) return;

    const datos = {
      nombre: formulario.nombre.trim(),
      apellidos: formulario.apellidos.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      password: formulario.password,
      institutionId: Number(formulario.institucionId),
    };

    if (
      datos.nombre.length < 3 ||
      datos.nombre.length > 30
    ) {
      setError(
        "El nombre debe tener entre 3 y 30 caracteres."
      );
      return;
    }

    if (
      datos.apellidos.length < 3 ||
      datos.apellidos.length > 100
    ) {
      setError(
        "Los apellidos deben tener entre 3 y 100 caracteres."
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        datos.correo
      )
    ) {
      setError("Introduce un correo válido.");
      return;
    }

    if (
      !Number.isSafeInteger(datos.institutionId) ||
      datos.institutionId <= 0 ||
      !instituciones.some(
        (item) =>
          Number(item.id_institucion) ===
          datos.institutionId
      )
    ) {
      setError(
        "Selecciona una institución válida del catálogo."
      );
      return;
    }

    if (!validarTelefono(datos.telefono)) {
      setError(
        "El teléfono debe tener formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    // La contraseña únicamente se solicita en creación.
    if (
      !editando &&
      !/^[a-zA-Z0-9]{8,50}$/.test(datos.password)
    ) {
      setError(
        "La contraseña inicial debe tener entre 8 y 50 caracteres alfanuméricos."
      );
      return;
    }

    // Evita correos duplicados entre las cuentas visibles.
    // MariaDB también valida su restricción UNIQUE.
    const correoDuplicado = cuentas.some(
      (cuenta) =>
        cuenta.correo?.toLowerCase() === datos.correo &&
        cuenta.id !== editando?.id
    );

    if (correoDuplicado) {
      setError(
        "Ya existe una cuenta con ese correo."
      );
      return;
    }

    setGuardando(true);
    setError("");

    try {
      if (editando) {
        await editarAlimentador(
          editando.id,
          datos
        );

        setAviso(
          "Alimentador actualizado correctamente en MariaDB."
        );
      } else {
        await registrarAlimentador(datos);

        setAviso(
          "Alimentador registrado correctamente en MariaDB."
        );
      }

      setAbierto(false);
      setEditando(null);

      await recargarCuentas();
    } catch (err) {
      setError(
        err.message ||
          "No fue posible guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  /**
   * Desactiva o reactiva una cuenta alimentadora.
   *
   * PATCH /admin/alimentadores/:id/estado
   *
   * El backend actualiza usuario.es_activo
   * y revoca la firma JWT.
   *
   * @param {Object} cuenta - Cuenta seleccionada.
   * @returns {Promise<void>}
   */
  async function alternarEstado(cuenta) {
    if (guardando || !esAlimentador) return;

    const nuevoEstado = cuenta.estado !== "Activo";

    const accion = nuevoEstado
      ? "reactivar"
      : "desactivar";

    const confirmado = window.confirm(
      `¿Confirmas ${accion} la cuenta de ` +
        `${cuenta.nombre} ${cuenta.apellidos}?`
    );

    if (!confirmado) return;

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      await cambiarEstadoAlimentador(
        cuenta.id,
        nuevoEstado
      );

      setAviso(
        `Cuenta ${
          nuevoEstado ? "reactivada" : "desactivada"
        } correctamente en MariaDB.`
      );

      await recargarCuentas();
    } catch (err) {
      setError(
        err.message ||
          "No fue posible cambiar el estado."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="alimentadores-admin">
      {/* Encabezado */}
      <div className="alimentadores-header">
        <div>
          <h1>Cuentas de {titulo}</h1>
          <p>
            Administra las cuentas y sus instituciones
            asignadas.
          </p>
        </div>

        <button
          type="button"
          className="alimentadores-boton-nuevo"
          onClick={abrirCreacion}
          disabled={!esAlimentador || guardando}
        >
          <Plus size={18} />
          Nueva cuenta
        </button>
      </div>

      {/* Mensajes de operaciones */}
      {aviso && (
        <p role="status">{aviso}</p>
      )}

      {error && !abierto && (
        <p
          role="alert"
          className="alimentador-formulario-error"
        >
          {error}
        </p>
      )}

      {cargandoCatalogos && (
        <p role="status">
          Cargando instituciones...
        </p>
      )}

      {errorCatalogos && (
        <div role="alert">
          <p>{errorCatalogos}</p>

          <button
            type="button"
            onClick={() => {
              setCargandoCatalogos(true);
              setErrorCatalogos("");
              setRevisionCatalogos(
                (valor) => valor + 1
              );
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estadísticas */}
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

      {/* Búsqueda y filtros */}
      <div className="alimentadores-herramientas">
        <div className="alimentadores-buscador">
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
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(evento) =>
            setEstado(evento.target.value)
          }
        >
          <option value="Todos">
            Todas las cuentas
          </option>
          <option value="Activo">Activas</option>
          <option value="Inactivo">Inactivas</option>
        </select>

        <select
          aria-label="Filtrar por institución"
          value={institucion}
          onChange={(evento) =>
            setInstitucion(evento.target.value)
          }
        >
          <option value="Todas">
            Todas las instituciones
          </option>

          {nombresInstituciones.map((nombre) => (
            <option key={nombre} value={nombre}>
              {nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Listado de cuentas */}
      <div className="alimentadores-lista">
        <div className="alimentadores-lista-header">
          <h2>Personal {titulo}</h2>

          <span>
            {cuentasFiltradas.length} de{" "}
            {totalCuentas} cuentas
          </span>
        </div>

        <div className="alimentadores-tabla-scroll">
          <table className="alimentadores-tabla">
            <thead>
              <tr>
                <th>
                  {esAlimentador
                    ? "Alimentador"
                    : "Administrador"}
                </th>
                <th>Correo electrónico</th>
                <th>Institución</th>
                <th>Municipios</th>

                {esAlimentador && (
                  <th>Reportes asignados</th>
                )}

                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cuentasFiltradas.length > 0 ? (
                cuentasFiltradas.map((cuenta) => (
                  <tr key={cuenta.id}>
                    <td>
                      <div className="alimentador-identidad">
                        <div className="alimentador-avatar">
                          {obtenerIniciales(
                            `${cuenta.nombre} ${cuenta.apellidos}`
                          )}
                        </div>

                        <div className="alimentador-nombre">
                          <strong>
                            {cuenta.nombre}{" "}
                            {cuenta.apellidos}
                          </strong>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="alimentador-correo">
                        {cuenta.correo}
                      </span>
                    </td>

                    <td>
                      {cuenta.institucion ||
                        "Sin asignar"}
                    </td>

                    <td>
                      {cuenta.municipios?.length
                        ? cuenta.municipios.join(", ")
                        : "No disponible"}
                    </td>

                    {esAlimentador && (
                      <td>
                        <span className="alimentador-reportes">
                          {cuenta.reportes ?? "—"}
                        </span>
                      </td>
                    )}

                    <td>
                      <span
                        className={`alimentador-estado ${
                          cuenta.estado === "Activo"
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {cuenta.estado}
                      </span>
                    </td>

                    <td>
                      <div className="alimentador-acciones">
                        <button
                          type="button"
                          className="alimentador-accion-editar"
                          disabled={
                            guardando || !esAlimentador
                          }
                          onClick={() =>
                            abrirEdicion(cuenta)
                          }
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={`alimentador-accion-estado ${
                            cuenta.estado === "Activo"
                              ? "desactivar"
                              : "activar"
                          }`}
                          disabled={
                            guardando || !esAlimentador
                          }
                          onClick={() =>
                            alternarEstado(cuenta)
                          }
                        >
                          <Power size={15} />

                          {cuenta.estado === "Activo"
                            ? "Desactivar"
                            : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={esAlimentador ? 7 : 6}>
                    <div className="alimentadores-vacio">
                      <Users size={30} />

                      <strong>
                        No se encontraron cuentas
                      </strong>

                      <p>
                        Prueba con otros filtros.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información sobre los datos */}
      <p className="alimentadores-nota">
        Las cuentas y sus estados se consultan desde
        la base de datos. La institución determina el territorio
        correspondiente.
      </p>

      {/* Formulario de creación y edición */}
      {abierto && (
        <div className="alimentador-modal-fondo">
          <div
            className="alimentador-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="gestion-cuentas-modal-titulo"
          >
            <div className="alimentador-modal-header">
              <div>
                <h2 id="gestion-cuentas-modal-titulo">
                  {editando
                    ? "Editar alimentador"
                    : "Nueva cuenta"}
                </h2>

                <p>
                  {editando
                    ? "Modifica los datos y guarda los cambios."
                    : "Registra una nueva cuenta alimentadora."}
                </p>
              </div>

              <button
                type="button"
                className="alimentador-modal-cerrar"
                onClick={cerrar}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar}>
              <div className="alimentador-formulario-campo">
                <label htmlFor="cuenta-nombre">
                  Nombre
                </label>

                <input
                  id="cuenta-nombre"
                  type="text"
                  minLength={3}
                  maxLength={30}
                  required
                  value={formulario.nombre}
                  onChange={(evento) =>
                    cambiar(
                      "nombre",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="cuenta-apellidos">
                  Apellidos
                </label>

                <input
                  id="cuenta-apellidos"
                  type="text"
                  minLength={3}
                  maxLength={100}
                  required
                  value={formulario.apellidos}
                  onChange={(evento) =>
                    cambiar(
                      "apellidos",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="cuenta-correo">
                  Correo electrónico
                </label>

                <input
                  id="cuenta-correo"
                  type="email"
                  required
                  value={formulario.correo}
                  onChange={(evento) =>
                    cambiar(
                      "correo",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="cuenta-telefono">
                  Teléfono
                </label>

                <input
                  id="cuenta-telefono"
                  type="tel"
                  placeholder="+525512345678"
                  value={formulario.telefono}
                  onChange={(evento) =>
                    cambiar(
                      "telefono",
                      evento.target.value
                    )
                  }
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="cuenta-institucion">
                  Institución
                </label>

                <select
                  id="cuenta-institucion"
                  required
                  value={formulario.institucionId}
                  disabled={
                    cargandoCatalogos ||
                    Boolean(errorCatalogos)
                  }
                  onChange={(evento) =>
                    cambiar(
                      "institucionId",
                      evento.target.value
                    )
                  }
                >
                  <option value="">
                    Selecciona una institución
                  </option>

                  {instituciones.map((item) => (
                    <option
                      key={item.id_institucion}
                      value={String(
                        item.id_institucion
                      )}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Contraseña solo para cuentas nuevas */}
              {!editando && (
                <div className="alimentador-formulario-campo">
                  <label htmlFor="cuenta-password">
                    Contraseña inicial
                  </label>

                  <input
                    id="cuenta-password"
                    type="password"
                    minLength={8}
                    maxLength={50}
                    autoComplete="new-password"
                    required
                    value={formulario.password}
                    onChange={(evento) =>
                      cambiar(
                        "password",
                        evento.target.value
                      )
                    }
                  />

                  <small>
                    Entre 8 y 50 letras o números.
                  </small>
                </div>
              )}

              <small>
                El municipio depende de la institución
                seleccionada.
              </small>

              {error && (
                <p
                  className="alimentador-formulario-error"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="alimentador-modal-acciones">
                <button
                  type="button"
                  className="alimentador-boton-cancelar"
                  onClick={cerrar}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="alimentador-boton-guardar"
                  disabled={
                    guardando ||
                    cargandoCatalogos ||
                    Boolean(errorCatalogos)
                  }
                >
                  {guardando
                    ? "Guardando..."
                    : editando
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