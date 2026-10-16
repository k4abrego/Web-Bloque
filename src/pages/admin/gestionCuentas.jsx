/**
 * gestionCuentas.jsx
 *
 * Componente reutilizable para gestionar temporalmente
 * cuentas de administradores y alimentadores.
 *
 * Funcionalidades:
 * - Visualizar cuentas.
 * - Crear cuentas temporales.
 * - Editar información de cuentas.
 * - Activar y desactivar cuentas visualmente.
 * - Filtrar por nombre, correo, estado, institución y municipio.
 * - Asignar una institución y varios municipios.
 *
 * IMPORTANTE:
 * Este componente NO realiza peticiones al backend.
 * Los cambios se guardan solamente en el estado de React
 * y desaparecen al recargar la página.
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

import "./alimentadoresAdmin.css";

/**
 * Catálogo provisional de municipios.
 *
 * Posteriormente se obtendrá desde el backend.
 */
const MUNICIPIOS = ["Atizapán de Zaragoza"];

/**
 * Catálogo provisional de instituciones.
 */
const INSTITUCIONES = [
  "SIPINNA Atizapán de Zaragoza",
];

/**
 * Valores iniciales del formulario.
 */
const NUEVO = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  institucion: "",
  municipios: [],
};

/**
 * Genera las iniciales utilizadas en el avatar.
 *
 * @param {string} nombre - Nombre completo.
 * @returns {string} Iniciales del usuario.
 */
function iniciales(nombre) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((palabra) => palabra[0]?.toUpperCase() || "")
    .join("");
}

/**
 * GestionCuentas
 *
 * Renderiza el panel de administración de cuentas.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {"alimentador"|"administrador"} props.tipo
 * Tipo de cuentas que se administran.
 * @param {Array<Object>} props.inicialesCuentas
 * Cuentas temporales iniciales.
 *
 * @returns {JSX.Element} Pantalla de gestión.
 */
export default function GestionCuentas({
  tipo,
  inicialesCuentas = [],
}) {
  /**
   * Determina el tipo de pantalla.
   */
  const esAlimentador = tipo === "alimentador";

  const titulo = esAlimentador
    ? "alimentadores"
    : "administradores";

  /**
   * Guarda las cuentas temporalmente en memoria.
   */
  const [cuentas, setCuentas] = useState(() =>
    inicialesCuentas.map((cuenta) => ({
      ...cuenta,
      municipios: [...(cuenta.municipios || [])],
    }))
  );

  /**
   * Estados de búsqueda y filtros.
   */
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [municipio, setMunicipio] = useState("Todos");
  const [institucion, setInstitucion] = useState("Todas");

  /**
   * Control del formulario modal.
   */
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(null);

  const [formulario, setFormulario] = useState({
    ...NUEVO,
    municipios: [],
  });

  const [error, setError] = useState("");

  /**
   * Calcula las estadísticas generales de las cuentas.
   */
  const totalCuentas = cuentas.length;

  const cuentasActivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Activo"
  ).length;

  const cuentasInactivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Inactivo"
  ).length;

  /**
   * Filtra las cuentas utilizando simultáneamente
   * la búsqueda, el estado, la institución y el municipio.
   */
  const filtradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      const textoBusqueda = busqueda
        .toLocaleLowerCase("es")
        .trim();

      const textoCuenta = [
        cuenta.nombre,
        cuenta.apellidos,
        cuenta.correo,
        cuenta.alias,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda =
        textoCuenta.includes(textoBusqueda);

      const coincideEstado =
        estado === "Todos" ||
        cuenta.estado === estado;

      const coincideInstitucion =
        institucion === "Todas" ||
        (institucion === "Sin asignar"
          ? !cuenta.institucion
          : cuenta.institucion === institucion);

      const coincideMunicipio =
        municipio === "Todos" ||
        (municipio === "Sin asignar"
          ? !cuenta.municipios?.length
          : cuenta.municipios?.includes(municipio));

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincideInstitucion &&
        coincideMunicipio
      );
    });
  }, [cuentas, busqueda, estado, municipio, institucion]);

  /**
   * Abre el formulario para crear o editar una cuenta.
   *
   * @param {Object|null} cuenta - Cuenta que se editará.
   */
  function abrir(cuenta = null) {
    setEditando(cuenta?.id ?? null);

    setFormulario(
      cuenta
        ? {
            nombre: cuenta.nombre || "",
            apellidos: cuenta.apellidos || "",
            correo: cuenta.correo || "",
            telefono: cuenta.telefono || "",
            institucion: cuenta.institucion || "",
            municipios: [...(cuenta.municipios || [])],
          }
        : {
            ...NUEVO,
            municipios: [],
          }
    );

    setError("");
    setAbierto(true);
  }

  /**
   * Cierra el formulario sin modificar las cuentas.
   */
  function cerrar() {
    setAbierto(false);
    setEditando(null);
    setError("");
  }

  /**
   * Actualiza un campo del formulario.
   *
   * @param {string} campo - Nombre del campo.
   * @param {string|Array} valor - Nuevo valor.
   */
  function cambiar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setError("");
  }

  /**
   * Agrega o elimina un municipio de la selección múltiple.
   *
   * @param {string} valor - Municipio seleccionado.
   */
  function alternarMunicipio(valor) {
    setFormulario((anterior) => ({
      ...anterior,
      municipios: anterior.municipios.includes(valor)
        ? anterior.municipios.filter(
            (municipioActual) => municipioActual !== valor
          )
        : [...anterior.municipios, valor],
    }));

    setError("");
  }

  /**
   * Valida y guarda una cuenta temporal.
   *
   * Si existe un identificador en edición, actualiza
   * la cuenta correspondiente. De lo contrario,
   * registra una nueva cuenta simulada.
   *
   * @param {React.FormEvent<HTMLFormElement>} evento
   */
  function guardar(evento) {
    evento.preventDefault();

    const datos = {
      ...formulario,
      nombre: formulario.nombre.trim(),
      apellidos: formulario.apellidos.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim(),
      municipios: [...formulario.municipios],
    };

    /**
     * Valida campos obligatorios.
     */
    if (
      !datos.nombre ||
      !datos.apellidos ||
      !datos.correo ||
      !datos.institucion ||
      !datos.municipios.length
    ) {
      setError(
        "Completa los datos obligatorios, la institución y al menos un municipio."
      );
      return;
    }

    /**
     * Valida el teléfono en formato internacional E.164.
     */
    if (
      datos.telefono &&
      !/^\+[1-9]\d{7,14}$/.test(datos.telefono)
    ) {
      setError(
        "El teléfono debe usar formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    /**
     * Impide registrar correos duplicados.
     */
    const correoExiste = cuentas.some(
      (cuenta) =>
        cuenta.correo.toLowerCase() === datos.correo &&
        cuenta.id !== editando
    );

    if (correoExiste) {
      setError("Ya existe una cuenta con ese correo.");
      return;
    }

    /**
     * Actualiza la cuenta existente.
     */
    if (editando !== null) {
      setCuentas((anteriores) =>
        anteriores.map((cuenta) =>
          cuenta.id === editando
            ? {
                ...cuenta,
                ...datos,
              }
            : cuenta
        )
      );
    } else {
      /**
       * Crea una cuenta temporal.
       */
      const id =
        Math.max(
          0,
          ...cuentas.map((cuenta) => cuenta.id)
        ) + 1;

      const nuevaCuenta = {
        ...datos,
        id,
        alias: `${
          esAlimentador ? "Alimentador" : "Administrador"
        } ${String(id).padStart(2, "0")}`,
        estado: "Activo",
        reportes: 0,
      };

      setCuentas((anteriores) => [
        ...anteriores,
        nuevaCuenta,
      ]);
    }

    cerrar();
  }

  /**
   * Activa o desactiva visualmente una cuenta.
   *
   * No cambia los permisos reales del usuario.
   *
   * @param {number} id - ID de la cuenta.
   */
  function alternarEstado(id) {
    setCuentas((anteriores) =>
      anteriores.map((cuenta) =>
        cuenta.id === id
          ? {
              ...cuenta,
              estado:
                cuenta.estado === "Activo"
                  ? "Inactivo"
                  : "Activo",
            }
          : cuenta
      )
    );
  }

  return (
    <div className="alimentadores-admin">

      {/* Encabezado principal */}
      <div className="alimentadores-header">
        <div>
          <h1>Cuentas de {titulo}</h1>

          <p>
            Administra las cuentas, instituciones y
            municipios asignados.
          </p>
        </div>

        <button
          type="button"
          className="alimentadores-boton-nuevo"
          onClick={() => abrir()}
        >
          <Plus size={18} />
          Nueva cuenta
        </button>
      </div>

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
          <option value="Todos">Todas las cuentas</option>
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
          <option value="Todas">Todas las instituciones</option>

          {INSTITUCIONES.map((institucionActual) => (
            <option
              key={institucionActual}
              value={institucionActual}
            >
              {institucionActual}
            </option>
          ))}

          <option value="Sin asignar">
            Sin asignar
          </option>
        </select>

        <select
          aria-label="Filtrar por municipio"
          value={municipio}
          onChange={(evento) =>
            setMunicipio(evento.target.value)
          }
        >
          <option value="Todos">Todos los municipios</option>

          {MUNICIPIOS.map((municipioActual) => (
            <option
              key={municipioActual}
              value={municipioActual}
            >
              {municipioActual}
            </option>
          ))}

          <option value="Sin asignar">
            Sin asignar
          </option>
        </select>

      </div>

      {/* Tabla de cuentas */}
      <div className="alimentadores-lista">

        <div className="alimentadores-lista-header">
          <h2>Personal {titulo}</h2>

          <span>
            {filtradas.length} de {totalCuentas} cuentas
          </span>
        </div>

        <div className="alimentadores-tabla-scroll">

          <table className="alimentadores-tabla">
            <thead>
              <tr>
                <th>
                  {esAlimentador ? "Alimentador" : "Administrador"}
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
              {filtradas.length > 0 ? (
                filtradas.map((cuenta) => (
                  <tr key={cuenta.id}>

                    <td>
                      <div className="alimentador-identidad">

                        <div className="alimentador-avatar">
                          {iniciales(
                            `${cuenta.nombre} ${cuenta.apellidos || ""}`
                          )}
                        </div>

                        <div className="alimentador-nombre">
                          <strong>
                            {cuenta.nombre} {cuenta.apellidos || ""}
                          </strong>

                          <span>{cuenta.alias || `Cuenta ${cuenta.id}`}</span>
                        </div>

                      </div>
                    </td>

                    <td>
                      <span className="alimentador-correo">
                        {cuenta.correo}
                      </span>
                    </td>

                    <td>
                      {cuenta.institucion || "Sin asignar"}
                    </td>

                    <td>
                      {cuenta.municipios?.length
                        ? cuenta.municipios.join(", ")
                        : "Sin asignar"}
                    </td>

                    {esAlimentador && (
                      <td>
                        <span className="alimentador-reportes">
                          {cuenta.reportes || 0}
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
                          onClick={() => abrir(cuenta)}
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
                          onClick={() =>
                            alternarEstado(cuenta.id)
                          }
                        >
                          <Power size={15} />
                          {cuenta.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"}
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

      {/* Aviso sobre datos temporales */}
      <p className="alimentadores-nota">
        Los cambios realizados son temporales y no modifican
        cuentas reales ni permisos de acceso.
      </p>

      {/* Modal para registrar o editar cuentas */}
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
                  {editando !== null
                    ? "Editar cuenta"
                    : "Nueva cuenta"}
                </h2>

                <p>
                  Registra la información del personal
                  {esAlimentador
                    ? " alimentador."
                    : " administrador."}
                </p>
              </div>

              <button
                type="button"
                className="alimentador-modal-cerrar"
                onClick={cerrar}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>

            </div>

            <form onSubmit={guardar}>

              {/* Nombre */}
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-nombre">
                  Nombre
                </label>

                <input
                  id="gestion-nombre"
                  type="text"
                  minLength={3}
                  maxLength={30}
                  value={formulario.nombre}
                  onChange={(evento) =>
                    cambiar("nombre", evento.target.value)
                  }
                  required
                />
              </div>

              {/* Apellidos */}
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-apellidos">
                  Apellidos
                </label>

                <input
                  id="gestion-apellidos"
                  type="text"
                  minLength={3}
                  maxLength={100}
                  value={formulario.apellidos}
                  onChange={(evento) =>
                    cambiar("apellidos", evento.target.value)
                  }
                  required
                />
              </div>

              {/* Correo electrónico */}
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-correo">
                  Correo electrónico
                </label>

                <input
                  id="gestion-correo"
                  type="email"
                  value={formulario.correo}
                  onChange={(evento) =>
                    cambiar("correo", evento.target.value)
                  }
                  required
                />
              </div>

              {/* Teléfono */}
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-telefono">
                  Teléfono (opcional)
                </label>

                <input
                  id="gestion-telefono"
                  type="tel"
                  placeholder="+525512345678"
                  value={formulario.telefono}
                  onChange={(evento) =>
                    cambiar("telefono", evento.target.value)
                  }
                />
              </div>

              {/* Institución */}
              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-institucion">
                  Institución
                </label>

                <select
                  id="gestion-institucion"
                  value={formulario.institucion}
                  onChange={(evento) =>
                    cambiar("institucion", evento.target.value)
                  }
                  required
                >
                  <option value="">
                    Selecciona una institución
                  </option>

                  {INSTITUCIONES.map((institucionActual) => (
                    <option
                      key={institucionActual}
                      value={institucionActual}
                    >
                      {institucionActual}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección múltiple de municipios */}
              <div className="alimentador-formulario-campo">
                <label>Municipios asignados</label>

                <div className="gestion-municipios-selector">
                  {MUNICIPIOS.map((municipioActual) => (
                    <label
                      key={municipioActual}
                      className="gestion-municipio-opcion"
                    >
                      <input
                        type="checkbox"
                        checked={formulario.municipios.includes(
                          municipioActual
                        )}
                        onChange={() =>
                          alternarMunicipio(municipioActual)
                        }
                      />

                      <span>{municipioActual}</span>
                    </label>
                  ))}
                </div>

                <small className="gestion-municipios-ayuda">
                  Puedes seleccionar varios municipios.
                </small>
              </div>

              {/* Errores del formulario */}
              {error && (
                <p className="alimentador-formulario-error">
                  {error}
                </p>
              )}

              {/* Acciones */}
              <div className="alimentador-modal-acciones">

                <button
                  type="button"
                  className="alimentador-boton-cancelar"
                  onClick={cerrar}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="alimentador-boton-guardar"
                >
                  {editando !== null
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
