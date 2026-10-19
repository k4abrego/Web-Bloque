/**
 * @file gestionCuentas.jsx
 * @description Panel compartido de cuentas institucionales.
 *
 * Funcionalidades:
 * - Consulta instituciones y territorios reales de comms-api.
 * - Muestra cuentas recibidas del backend.
 * - Permite buscar y filtrar registros.
 * - Registra alimentadores mediante auth-backend.
 * - Solicita actualizar la lista tras un registro exitoso.
 *
 * La edición y el cambio de estado institucional están
 * deshabilitados hasta contar con endpoints reales.
 *
 * La autorización efectiva corresponde al backend.
 */

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
} from "../../services/cuentasInstitucionalesApi";

import "./alimentadoresAdmin.css";

/**
 * Campos iniciales del formulario.
 *
 * La contraseña únicamente se utiliza durante
 * el registro de una nueva cuenta.
 */
const NUEVO = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  institucion: "",
  municipios: [],
  password: "",
};

/**
 * Obtiene hasta dos iniciales de un nombre.
 *
 * @param {string} nombre - Nombre completo.
 * @returns {string} Iniciales en mayúsculas.
 */
function iniciales(nombre) {
  return String(nombre || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) =>
      parte[0]?.toUpperCase() || ""
    )
    .join("");
}

/**
 * Consulta los catálogos de instituciones y territorios.
 *
 * @returns {Promise<{
 *   instituciones: Object[],
 *   municipios: Object[]
 * }>} Catálogos obtenidos desde comms-api.
 *
 * @throws {Error} Cuando alguna respuesta es inválida.
 */
async function consultarCatalogos() {
  const [
    respuestaInstituciones,
    respuestaTerritorios,
  ] = await Promise.all([
    apiFetch("/instituciones"),
    apiFetch("/territorios"),
  ]);

  if (!Array.isArray(respuestaInstituciones)) {
    throw new Error(
      "La API no devolvió una lista válida de instituciones."
    );
  }

  if (
    !Array.isArray(respuestaTerritorios?.territorios)
  ) {
    throw new Error(
      "La API no devolvió una lista válida de territorios."
    );
  }

  return {
    instituciones: respuestaInstituciones.filter(
      (item) =>
        item?.id_institucion != null &&
        item?.nombre
    ),

    municipios: respuestaTerritorios.territorios.filter(
      (item) =>
        item?.id_territorio != null &&
        item?.nombre
    ),
  };
}

/**
 * GestionCuentas
 *
 * Componente compartido para presentar cuentas
 * administrativas o alimentadoras.
 *
 * El registro real está habilitado únicamente
 * para alimentadores.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {"alimentador"|"administrador"} props.tipo
 * Tipo de cuenta que se presenta.
 * @param {Object[]} [props.inicialesCuentas=[]]
 * Registros obtenidos por el componente padre.
 * @param {Function} [props.onCuentaCreada]
 * Función que solicita actualizar la lista real.
 *
 * @returns {import("react").JSX.Element}
 * Panel de cuentas institucionales.
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

  /**
   * Cuentas reales que recibe el componente.
   *
   * No se insertan registros ficticios después de guardar.
   */
  const cuentas = inicialesCuentas;

  const [
    institucionesCatalogo,
    setInstitucionesCatalogo,
  ] = useState([]);

  const [
    municipiosCatalogo,
    setMunicipiosCatalogo,
  ] = useState([]);

  const [
    cargandoCatalogos,
    setCargandoCatalogos,
  ] = useState(true);

  const [
    errorCatalogos,
    setErrorCatalogos,
  ] = useState("");

  const [
    intentoCatalogos,
    setIntentoCatalogos,
  ] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos");
  const [municipio, setMunicipio] = useState("Todos");
  const [institucion, setInstitucion] = useState("Todas");

  const [abierto, setAbierto] = useState(false);
  const [formulario, setFormulario] = useState({
    ...NUEVO,
    municipios: [],
  });

  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  /**
   * Solicita los catálogos reales al montar el componente
   * o cuando se pulsa Reintentar.
   *
   * Ignora resultados si el componente se desmonta.
   */
  useEffect(() => {
    let vigente = true;

    consultarCatalogos()
      .then(({ instituciones, municipios }) => {
        if (!vigente) return;

        setInstitucionesCatalogo(instituciones);
        setMunicipiosCatalogo(municipios);
        setErrorCatalogos("");
      })
      .catch((err) => {
        if (!vigente) return;

        setErrorCatalogos(
          err.message ||
          "No fue posible consultar los catálogos."
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
  }, [intentoCatalogos]);

  /**
   * Combina instituciones registradas en el catálogo
   * con las que aparecen en las cuentas existentes.
   */
  const nombresInstituciones = useMemo(
    () =>
      Array.from(
        new Set([
          ...institucionesCatalogo.map(
            (item) => item.nombre
          ),
          ...cuentas
            .map((cuenta) => cuenta.institucion)
            .filter(Boolean),
        ])
      ).sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    [institucionesCatalogo, cuentas]
  );

  /**
   * Obtiene los municipios disponibles para los filtros.
   */
  const nombresMunicipios = useMemo(
    () =>
      Array.from(
        new Set([
          ...municipiosCatalogo.map(
            (item) => item.nombre
          ),
          ...cuentas.flatMap(
            (cuenta) => cuenta.municipios || []
          ),
        ])
      ).sort((a, b) =>
        a.localeCompare(b, "es")
      ),
    [municipiosCatalogo, cuentas]
  );

  /**
   * Estadísticas calculadas con los registros
   * proporcionados por el backend.
   */
  const totalCuentas = cuentas.length;

  const cuentasActivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Activo"
  ).length;

  const cuentasInactivas = cuentas.filter(
    (cuenta) => cuenta.estado === "Inactivo"
  ).length;

  /**
   * Aplica los filtros de búsqueda, estado,
   * institución y municipio.
   */
  const filtradas = useMemo(
    () =>
      cuentas.filter((cuenta) => {
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
          busqueda
            .trim()
            .toLocaleLowerCase("es")
        );

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
            ? !(cuenta.municipios || []).length
            : (cuenta.municipios || []).includes(
                municipio
              ));

        return (
          coincideBusqueda &&
          coincideEstado &&
          coincideInstitucion &&
          coincideMunicipio
        );
      }),
    [
      cuentas,
      busqueda,
      estado,
      institucion,
      municipio,
    ]
  );

  /**
   * Abre el formulario para crear una cuenta nueva.
   *
   * La edición de cuentas institucionales todavía
   * no está habilitada.
   *
   * @returns {void}
   */
  function abrir() {
    if (!esAlimentador) return;

    setFormulario({
      ...NUEVO,
      municipios: [],
    });

    setError("");
    setAviso("");
    setAbierto(true);
  }

  /**
   * Cierra el formulario y limpia el error.
   *
   * @returns {void}
   */
  function cerrar() {
    if (guardando) return;

    setAbierto(false);
    setError("");
  }

  /**
   * Actualiza un campo del formulario.
   *
   * @param {string} campo - Nombre del campo.
   * @param {string} valor - Valor nuevo.
   * @returns {void}
   */
  function cambiar(campo, valor) {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setError("");
  }

  /**
   * Registra un alimentador en MariaDB.
   *
   * Valida el formulario, identifica la institución
   * en el catálogo y llama al servicio de autenticación.
   *
   * No modifica la lista localmente. Solicita
   * una nueva consulta al componente padre.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} evento
   * Evento de envío del formulario.
   * @returns {Promise<void>}
   */
  async function guardar(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!esAlimentador) {
      setError(
        "El registro de administradores todavía no está habilitado."
      );
      return;
    }

    const datos = {
      nombre: formulario.nombre.trim(),
      apellidos: formulario.apellidos.trim(),
      correo: formulario.correo
        .trim()
        .toLowerCase(),
      telefono: formulario.telefono.trim(),
      password: formulario.password,
    };

    const institucionSeleccionada =
      institucionesCatalogo.find(
        (item) =>
          item.nombre === formulario.institucion
      );

    if (
      !datos.nombre ||
      !datos.apellidos ||
      !datos.correo ||
      !institucionSeleccionada
    ) {
      setError(
        "Completa los datos y selecciona una institución del catálogo real."
      );
      return;
    }

    /**
     * La contraseña debe cumplir con las reglas
     * actuales de registerJSON en auth-backend.
     */
    if (!/^[a-zA-Z0-9]{8,50}$/.test(datos.password)) {
      setError(
        "La contraseña inicial debe contener entre 8 y 50 caracteres alfanuméricos, sin símbolos."
      );
      return;
    }

    /**
     * El teléfono es opcional, pero cuando se proporciona
     * debe respetar el formato internacional E.164.
     */
    if (
      datos.telefono &&
      !/^\+[1-9]\d{7,14}$/.test(datos.telefono)
    ) {
      setError(
        "El teléfono debe tener formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    if (
      cuentas.some(
        (cuenta) =>
          cuenta.correo.toLowerCase() === datos.correo
      )
    ) {
      setError(
        "Ya existe una cuenta visible con ese correo."
      );
      return;
    }

    setGuardando(true);
    setError("");

    try {
      await registrarAlimentador({
        ...datos,
        institutionId:
          institucionSeleccionada.id_institucion,
      });

      /**
       * El registro ya fue confirmado por auth-backend.
       * Pedimos al padre consultar nuevamente MariaDB.
       */
      setAbierto(false);

      setAviso(
        "Cuenta registrada en MariaDB. Actualizando la lista..."
      );

      if (onCuentaCreada) {
        await onCuentaCreada();
      }
    } catch (err) {
      setError(
        err.message ||
        "No fue posible registrar la cuenta."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="alimentadores-admin">
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
          onClick={abrir}
          disabled={!esAlimentador}
          title={
            !esAlimentador
              ? "Registro de administradores pendiente"
              : undefined
          }
        >
          <Plus size={18} />
          Nueva cuenta
        </button>
      </div>

      {aviso && (
        <p role="status">{aviso}</p>
      )}

      {cargandoCatalogos && (
        <p role="status">
          Cargando instituciones y municipios...
        </p>
      )}

      {errorCatalogos && (
        <div
          role="alert"
          style={{ marginBottom: 16 }}
        >
          No se pudieron cargar todos los catálogos:{" "}
          {errorCatalogos}{" "}

          <button
            type="button"
            onClick={() => {
              setCargandoCatalogos(true);
              setErrorCatalogos("");
              setIntentoCatalogos((n) => n + 1);
            }}
          >
            Reintentar
          </button>
        </div>
      )}

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
            onChange={(e) =>
              setBusqueda(e.target.value)
            }
          />
        </div>

        <select
          aria-label="Filtrar por estado"
          value={estado}
          onChange={(e) =>
            setEstado(e.target.value)
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
          onChange={(e) =>
            setInstitucion(e.target.value)
          }
        >
          <option value="Todas">
            Todas las instituciones
          </option>

          {nombresInstituciones.map((nombre) => (
            <option
              key={nombre}
              value={nombre}
            >
              {nombre}
            </option>
          ))}

          <option value="Sin asignar">
            Sin asignar
          </option>
        </select>

        <select
          aria-label="Filtrar por municipio"
          value={municipio}
          onChange={(e) =>
            setMunicipio(e.target.value)
          }
        >
          <option value="Todos">
            Todos los municipios
          </option>

          {nombresMunicipios.map((nombre) => (
            <option
              key={nombre}
              value={nombre}
            >
              {nombre}
            </option>
          ))}

          <option value="Sin asignar">
            Sin asignar
          </option>
        </select>
      </div>

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
              {filtradas.length ? (
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
                            {cuenta.nombre}{" "}
                            {cuenta.apellidos || ""}
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
                          {cuenta.reportes ?? 0}
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
                          disabled
                          title="La edición institucional aún no está habilitada"
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
                          disabled
                          title="El cambio de estado institucional aún no está habilitado"
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

      <p className="alimentadores-nota">
        La creación de alimentadores se guarda en
        la base de datos.
      </p>

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
                  Nueva cuenta
                </h2>

                <p>
                  Registra la información del personal
                  alimentador.
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
                <label htmlFor="gestion-nombre">
                  Nombre
                </label>

                <input
                  id="gestion-nombre"
                  type="text"
                  minLength={3}
                  maxLength={30}
                  value={formulario.nombre}
                  onChange={(e) =>
                    cambiar("nombre", e.target.value)
                  }
                  required
                />
              </div>

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
                  onChange={(e) =>
                    cambiar("apellidos", e.target.value)
                  }
                  required
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-correo">
                  Correo electrónico
                </label>

                <input
                  id="gestion-correo"
                  type="email"
                  value={formulario.correo}
                  onChange={(e) =>
                    cambiar("correo", e.target.value)
                  }
                  required
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-telefono">
                  Teléfono (opcional)
                </label>

                <input
                  id="gestion-telefono"
                  type="tel"
                  placeholder="+525512345678"
                  value={formulario.telefono}
                  onChange={(e) =>
                    cambiar("telefono", e.target.value)
                  }
                />
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-institucion">
                  Institución
                </label>

                <select
                  id="gestion-institucion"
                  value={formulario.institucion}
                  onChange={(e) =>
                    cambiar("institucion", e.target.value)
                  }
                  disabled={
                    cargandoCatalogos ||
                    !!errorCatalogos
                  }
                  required
                >
                  <option value="">
                    Selecciona una institución
                  </option>

                  {institucionesCatalogo.map((item) => (
                    <option
                      key={item.id_institucion}
                      value={item.nombre}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="alimentador-formulario-campo">
                <label htmlFor="gestion-password">
                  Contraseña inicial
                </label>

                <input
                  id="gestion-password"
                  type="password"
                  minLength={8}
                  maxLength={50}
                  autoComplete="new-password"
                  required
                  value={formulario.password}
                  onChange={(e) =>
                    cambiar("password", e.target.value)
                  }
                />

                <small>
                  Entre 8 y 50 letras o números.
                  Compártela con la persona de forma segura.
                </small>
              </div>

              <small>
                El municipio se determina por la
                institución registrada; no se asignan
                municipios adicionales desde este formulario.
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
                    !!errorCatalogos
                  }
                >
                  {guardando
                    ? "Guardando en MariaDB..."
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