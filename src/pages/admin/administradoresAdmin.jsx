/**
 * @file administradoresAdmin.jsx
 * @description Gestión de administradores reales de SIPINNA.
 *
 * Permite:
 * - Consultar administradores desde MariaDB.
 * - Consultar el catálogo real de instituciones.
 * - Buscar y filtrar cuentas por estado.
 * - Registrar administradores.
 * - Editar datos personales e institución.
 * - Desactivar y reactivar administradores.
 *
 * La cuenta principal ID 3 está protegida contra
 * la desactivación.
 *
 * La autorización efectiva se realiza en auth-backend.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Pencil,
  Power,
  X,
  Search,
} from "lucide-react";

import { apiFetch } from "../../services/api";

import {
  obtenerAdministradores,
  registrarAdministrador,
  editarAdministrador,
  cambiarEstadoAdministrador,
} from "../../services/administradoresApi";

import "./alimentadoresAdmin.css";

/** Campos iniciales del formulario institucional. */
const VACIO = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
  institutionId: "",
  password: "",
};

/**
 * Valida números telefónicos internacionales.
 *
 * @param {string} telefono - Número telefónico.
 * @returns {boolean} Indica si cumple E.164.
 */
function telefonoValido(telefono) {
  return (
    !telefono ||
    /^\+[1-9]\d{7,14}$/.test(telefono)
  );
}

/**
 * Devuelve las iniciales de un nombre.
 *
 * @param {string} nombre - Nombre completo.
 * @returns {string} Iniciales.
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
 * AdministradoresAdmin
 *
 * Pantalla conectada a los administradores e instituciones
 * reales de la base de datos.
 *
 * @returns {import("react").JSX.Element}
 */
export default function AdministradoresAdmin() {
  const [cuentas, setCuentas] = useState([]);
  const [instituciones, setInstituciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState("Todos");

  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ ...VACIO });
  const [revision, setRevision] = useState(0);

  /**
   * Vuelve a consultar las cuentas y el catálogo real.
   *
   * Se utiliza después de crear, editar o modificar el
   * estado de una cuenta.
   *
   * @returns {Promise<void>}
   */
  const cargar = useCallback(async () => {
    const [lista, catalogo] = await Promise.all([
      obtenerAdministradores(),
      apiFetch("/instituciones"),
    ]);

    if (
      !Array.isArray(lista) ||
      !Array.isArray(catalogo)
    ) {
      throw new Error(
        "El servidor devolvió una respuesta inválida."
      );
    }

    setCuentas(lista);

    setInstituciones(
      catalogo.filter(
        (item) =>
          item?.id_institucion != null &&
          item?.nombre
      )
    );
  }, []);

  /**
   * Carga los datos al ingresar a la pantalla.
   *
   * Evita actualizar el componente después del desmontaje.
   */
  useEffect(() => {
    let vigente = true;

    Promise.all([
      obtenerAdministradores(),
      apiFetch("/instituciones"),
    ])
      .then(([lista, catalogo]) => {
        if (!vigente) return;

        if (
          !Array.isArray(lista) ||
          !Array.isArray(catalogo)
        ) {
          throw new Error(
            "El servidor devolvió una respuesta inválida."
          );
        }

        setCuentas(lista);

        setInstituciones(
          catalogo.filter(
            (item) =>
              item?.id_institucion != null &&
              item?.nombre
          )
        );

        setError("");
      })
      .catch((err) => {
        if (!vigente) return;

        setError(
          err.message ||
          "No se pudieron consultar los administradores."
        );
      })
      .finally(() => {
        if (vigente) {
          setCargando(false);
        }
      });

    return () => {
      vigente = false;
    };
  }, [revision]);

  /**
   * Filtra las cuentas por nombre, correo, institución
   * y estado.
   */
  const filtradas = useMemo(() => {
    return cuentas.filter((cuenta) => {
      const texto = [
        cuenta.nombre,
        cuenta.apellidos,
        cuenta.correo,
        cuenta.institucion,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("es");

      const coincideBusqueda = texto.includes(
        busqueda.trim().toLocaleLowerCase("es")
      );

      const estadoCuenta = cuenta.es_activo
        ? "Activo"
        : "Inactivo";

      const coincideEstado =
        estado === "Todos" ||
        estadoCuenta === estado;

      return coincideBusqueda && coincideEstado;
    });
  }, [cuentas, busqueda, estado]);

  /**
   * Abre el formulario para registrar un administrador.
   */
  function abrirNuevo() {
    setEditando(null);
    setForm({ ...VACIO });
    setError("");
    setAviso("");
    setModal(true);
  }

  /**
   * Prepara la edición con los datos existentes.
   *
   * @param {Object} cuenta - Administrador seleccionado.
   */
  function abrirEditar(cuenta) {
    setEditando(cuenta);

    setForm({
      nombre: cuenta.nombre || "",
      apellidos: cuenta.apellidos || "",
      correo: cuenta.correo || "",
      telefono: cuenta.telefono || "",
      institutionId: String(cuenta.id_institucion),
      password: "",
    });

    setError("");
    setAviso("");
    setModal(true);
  }

  /**
   * Modifica un campo del formulario.
   *
   * @param {string} campo - Campo editado.
   * @param {string} valor - Nuevo valor.
   */
  function actualizarCampo(campo, valor) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    setError("");
  }

  /**
   * Cierra el formulario cuando no hay operaciones activas.
   */
  function cerrarModal() {
    if (guardando) return;

    setModal(false);
    setEditando(null);
    setError("");
  }

  /**
   * Crea o actualiza una cuenta administradora.
   *
   * La operación se confirma mediante auth-backend
   * antes de volver a consultar MariaDB.
   *
   * @param {import("react").FormEvent<HTMLFormElement>} evento
   * @returns {Promise<void>}
   */
  async function guardar(evento) {
    evento.preventDefault();

    if (guardando) return;

    const datos = {
      nombre: form.nombre.trim(),
      apellidos: form.apellidos.trim(),
      correo: form.correo.trim().toLowerCase(),
      telefono: form.telefono.trim(),
      institutionId: Number(form.institutionId),
      password: form.password,
    };

    if (
      datos.nombre.length < 3 ||
      datos.nombre.length > 30 ||
      datos.apellidos.length < 3 ||
      datos.apellidos.length > 100
    ) {
      setError(
        "El nombre o los apellidos no cumplen con los límites permitidos."
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

    if (!telefonoValido(datos.telefono)) {
      setError(
        "El teléfono debe tener formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    const institucionValida = instituciones.some(
      (item) =>
        Number(item.id_institucion) ===
        datos.institutionId
    );

    if (!institucionValida) {
      setError(
        "Selecciona una institución válida."
      );
      return;
    }

    if (
      !editando &&
      !/^[a-zA-Z0-9]{8,50}$/.test(datos.password)
    ) {
      setError(
        "La contraseña debe tener entre 8 y 50 caracteres alfanuméricos."
      );
      return;
    }

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      if (editando) {
        await editarAdministrador(
          editando.id_usuario,
          datos
        );
      } else {
        await registrarAdministrador(datos);
      }

      await cargar();

      setModal(false);
      setEditando(null);

      setAviso(
        editando
          ? "Administrador actualizado en MariaDB."
          : "Administrador registrado en MariaDB."
      );
    } catch (err) {
      setError(
        err.message ||
        "No fue posible guardar los datos."
      );
    } finally {
      setGuardando(false);
    }
  }

  /**
   * Desactiva o reactiva un administrador.
   *
   * La cuenta principal ID 3 no puede desactivarse.
   *
   * @param {Object} cuenta - Cuenta seleccionada.
   * @returns {Promise<void>}
   */
  async function cambiarEstado(cuenta) {
    if (guardando) return;

    if (
      Number(cuenta.id_usuario) === 3 &&
      cuenta.es_activo
    ) {
      setError(
        "La cuenta principal ID 3 no puede desactivarse."
      );
      return;
    }

    const activo = !cuenta.es_activo;

    const confirmado = window.confirm(
      `¿Quieres ${
        activo ? "reactivar" : "desactivar"
      } a ${cuenta.nombre} ${cuenta.apellidos}?`
    );

    if (!confirmado) return;

    setGuardando(true);
    setError("");
    setAviso("");

    try {
      await cambiarEstadoAdministrador(
        cuenta.id_usuario,
        activo
      );

      await cargar();

      setAviso(
        activo
          ? "Administrador reactivado en MariaDB."
          : "Administrador desactivado en MariaDB."
      );
    } catch (err) {
      setError(
        err.message ||
        "No se pudo modificar el estado."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="alimentadores-admin">
      

      <div className="alimentadores-header">
        <div>
          <h1>Cuentas de administradores</h1>
          <p>
            Gestiona los administradores registrados
            en SIPINNA.
          </p>
        </div>

        <button
          type="button"
          className="alimentadores-boton-nuevo"
          onClick={abrirNuevo}
          disabled={guardando || cargando}
        >
          <Plus size={18} />
          Nueva cuenta
        </button>
      </div>

      {aviso && <p role="status">{aviso}</p>}

      {!modal && error && (
        <div
          role="alert"
          className="alimentador-formulario-error"
        >
          {error}

          <button
            type="button"
            onClick={() => {
              setCargando(true);
              setRevision((valor) => valor + 1);
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
            <strong>{cuentas.length}</strong>
          </div>
        </div>

        <div className="alimentadores-resumen-card">
          <div className="alimentadores-resumen-icono activas">
            <UserCheck size={22} />
          </div>
          <div>
            <span>Cuentas activas</span>
            <strong>
              {cuentas.filter(
                (cuenta) => cuenta.es_activo
              ).length}
            </strong>
          </div>
        </div>

        <div className="alimentadores-resumen-card">
          <div className="alimentadores-resumen-icono inactivas">
            <UserX size={22} />
          </div>
          <div>
            <span>Cuentas inactivas</span>
            <strong>
              {cuentas.filter(
                (cuenta) => !cuenta.es_activo
              ).length}
            </strong>
          </div>
        </div>
      </div>

      <div className="alimentadores-herramientas">
        <div className="alimentadores-buscador">
          <Search size={18} />

          <input
            type="search"
            placeholder="Buscar nombre, correo o institución..."
            value={busqueda}
            onChange={(evento) =>
              setBusqueda(evento.target.value)
            }
          />
        </div>

        <select
          aria-label="Filtrar administradores por estado"
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
      </div>

      <div className="alimentadores-lista">
        <div className="alimentadores-lista-header">
          <h2>Personal administrador</h2>

          <span>
            {filtradas.length} de {cuentas.length} cuentas
          </span>
        </div>

        <div className="alimentadores-tabla-scroll">
          <table className="alimentadores-tabla">
            <thead>
              <tr>
                <th>Administrador</th>
                <th>Correo electrónico</th>
                <th>Institución</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {cargando ? (
                <tr>
                  <td colSpan={5}>
                    Cargando administradores...
                  </td>
                </tr>
              ) : (
                filtradas.map((cuenta) => (
                  <tr key={cuenta.id_usuario}>
                    <td>
                      <div className="alimentador-identidad">
                        <div className="alimentador-avatar">
                          {iniciales(
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
                      {cuenta.institucion}
                    </td>

                    <td>
                      <span
                        className={`alimentador-estado ${
                          cuenta.es_activo
                            ? "activo"
                            : "inactivo"
                        }`}
                      >
                        {cuenta.es_activo
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <div className="alimentador-acciones">
                        <button
                          type="button"
                          className="alimentador-accion-editar"
                          disabled={guardando}
                          onClick={() =>
                            abrirEditar(cuenta)
                          }
                        >
                          <Pencil size={15} />
                          Editar
                        </button>

                        <button
                          type="button"
                          className={`alimentador-accion-estado ${
                            cuenta.es_activo
                              ? "desactivar"
                              : "activar"
                          }`}
                          disabled={
                            guardando ||
                            (
                              Number(cuenta.id_usuario) === 3 &&
                              cuenta.es_activo
                            )
                          }
                          title={
                            Number(cuenta.id_usuario) === 3 &&
                            cuenta.es_activo
                              ? "La cuenta principal está protegida."
                              : undefined
                          }
                          onClick={() =>
                            cambiarEstado(cuenta)
                          }
                        >
                          <Power size={15} />

                          {cuenta.es_activo
                            ? "Desactivar"
                            : "Reactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!cargando && filtradas.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    No se encontraron cuentas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="alimentador-modal-fondo">
          <div
            className="alimentador-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-admin-modal"
          >
            <div className="alimentador-modal-header">
              <div>
                <h2 id="titulo-admin-modal">
                  {editando
                    ? "Editar administrador"
                    : "Nuevo administrador"}
                </h2>

                <p>
                  Datos de la cuenta institucional.
                </p>
              </div>

              <button
                type="button"
                className="alimentador-modal-cerrar"
                onClick={cerrarModal}
                disabled={guardando}
                aria-label="Cerrar formulario"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={guardar}>
              {[
                ["nombre", "Nombre", "text", 30],
                ["apellidos", "Apellidos", "text", 100],
                ["correo", "Correo electrónico", "email", 254],
                ["telefono", "Teléfono", "tel", 30],
              ].map(([campo, etiqueta, tipo, maximo]) => (
                <div
                  className="alimentador-formulario-campo"
                  key={campo}
                >
                  <label htmlFor={`admin-${campo}`}>
                    {etiqueta}
                  </label>

                  <input
                    id={`admin-${campo}`}
                    type={tipo}
                    maxLength={maximo}
                    required={campo !== "telefono"}
                    value={form[campo]}
                    placeholder={
                      campo === "telefono"
                        ? "+525512345678"
                        : undefined
                    }
                    onChange={(evento) =>
                      actualizarCampo(
                        campo,
                        evento.target.value
                      )
                    }
                  />
                </div>
              ))}

              <div className="alimentador-formulario-campo">
                <label htmlFor="admin-institucion">
                  Institución
                </label>

                <select
                  id="admin-institucion"
                  value={form.institutionId}
                  onChange={(evento) =>
                    actualizarCampo(
                      "institutionId",
                      evento.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Selecciona una institución
                  </option>

                  {instituciones.map((item) => (
                    <option
                      key={item.id_institucion}
                      value={item.id_institucion}
                    >
                      {item.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {!editando && (
                <div className="alimentador-formulario-campo">
                  <label htmlFor="admin-password">
                    Contraseña inicial
                  </label>

                  <input
                    id="admin-password"
                    type="password"
                    minLength={8}
                    maxLength={50}
                    required
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(evento) =>
                      actualizarCampo(
                        "password",
                        evento.target.value
                      )
                    }
                  />

                  <small>
                    De 8 a 50 caracteres alfanuméricos.
                  </small>
                </div>
              )}

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
                  disabled={guardando}
                  onClick={cerrarModal}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="alimentador-boton-guardar"
                  disabled={guardando}
                >
                  {guardando
                    ? "Guardando..."
                    : editando
                      ? "Guardar cambios"
                      : "Crear administrador"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}