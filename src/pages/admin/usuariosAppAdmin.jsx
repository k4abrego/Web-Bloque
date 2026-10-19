/**
 * @file usuariosAppAdmin.jsx
 * @description Gestión de usuarios registrados desde la aplicación.
 *
 * Permite al administrador principal:
 * - Consultar cuentas reales desde MariaDB.
 * - Buscar y filtrar por estado.
 * - Editar datos personales.
 * - Desactivar o reactivar cuentas.
 *
 * La autorización efectiva se valida en auth-backend.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authApiFetch } from "../../services/api";
import "./alimentadoresAdmin.css";
import "./usuariosAppAdmin.css";

/**
 * Estructura inicial del formulario de edición.
 */
const FORMULARIO_VACIO = {
  nombre: "",
  apellidos: "",
  correo: "",
  telefono: "",
};

/**
 * UsuariosAppAdmin
 *
 * Pantalla de administración de cuentas no institucionales.
 *
 * @returns {JSX.Element} Interfaz de gestión de usuarios.
 */
export default function UsuariosAppAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(FORMULARIO_VACIO);

  /**
   * Consulta los usuarios directamente desde auth-backend.
   *
   * GET /admin/usuarios-app
   *
   * @returns {Promise<void>}
   */
  const cargar = useCallback(async () => {
    setCargando(true);

    try {
      const datos = await authApiFetch(
        "/admin/usuarios-app"
      );

      setUsuarios(
        Array.isArray(datos?.usuarios)
          ? datos.usuarios
          : []
      );

      setError("");
    } catch (err) {
      setError(
        err.message ||
          "No fue posible consultar los usuarios."
      );
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Ejecuta la primera consulta al montar la pantalla.
   */

    useEffect(() => {
    // Inicia la consulta de usuarios de manera asíncrona.
    // Evita actualizar el estado sincrónicamente dentro del efecto.
    const iniciarConsulta = async () => {
        await Promise.resolve();
        await cargar();
    };

    void iniciarConsulta();
    }, [cargar]);


  /**
   * Calcula los resultados visibles según el buscador
   * y el filtro de estado.
   */
  const filtrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const texto = [
        usuario.nombre,
        usuario.apellidos,
        usuario.correo,
      ]
        .join(" ")
        .toLowerCase();

      const coincideTexto = texto.includes(
        busqueda.toLowerCase()
      );

      const coincideEstado =
        filtro === "todos" ||
        (filtro === "activos"
          ? usuario.es_activo
          : !usuario.es_activo);

      return coincideTexto && coincideEstado;
    });
  }, [usuarios, busqueda, filtro]);

  /**
   * Abre el formulario con los datos del usuario.
   *
   * @param {Object} usuario Cuenta seleccionada.
   * @returns {void}
   */
  function abrir(usuario) {
    setEditando(usuario);

    setForm({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      correo: usuario.correo,
      telefono: usuario.telefono || "",
    });

    setError("");
    setMensaje("");
  }

  /**
   * Guarda los datos editados en MariaDB.
   *
   * PATCH /admin/usuarios-app/:id
   *
   * @param {React.FormEvent<HTMLFormElement>} event
   * @returns {Promise<void>}
   */
  async function guardar(event) {
    event.preventDefault();

    if (!editando || ocupado) {
      return;
    }

    const telefono = form.telefono.trim();

    if (
      telefono &&
      !/^\+[1-9]\d{7,14}$/.test(telefono)
    ) {
      setError(
        "El teléfono debe tener formato internacional, por ejemplo +525512345678."
      );
      return;
    }

    setOcupado(true);
    setError("");

    try {
      await authApiFetch(
        `/admin/usuarios-app/${editando.id_usuario}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            nombre: form.nombre.trim(),
            apellidos: form.apellidos.trim(),
            correo: form.correo.trim(),
            telefono: telefono || null,
          }),
        }
      );

      setEditando(null);
      setMensaje("Los datos se guardaron en MariaDB.");

      await cargar();
    } catch (err) {
      setError(
        err.message || "No fue posible guardar los cambios."
      );
    } finally {
      setOcupado(false);
    }
  }

  /**
   * Cambia el estado de una cuenta.
   *
   * PATCH /admin/usuarios-app/:id/estado
   *
   * @param {Object} usuario Cuenta seleccionada.
   * @returns {Promise<void>}
   */
  async function cambiarEstado(usuario) {
    if (ocupado) {
      return;
    }

    const accion = usuario.es_activo
      ? "desactivar"
      : "reactivar";

    const confirmado = window.confirm(
      `¿Confirmas ${accion} la cuenta de ${usuario.nombre} ${usuario.apellidos}?`
    );

    if (!confirmado) {
      return;
    }

    setOcupado(true);
    setError("");
    setMensaje("");

    try {
      await authApiFetch(
        `/admin/usuarios-app/${usuario.id_usuario}/estado`,
        {
          method: "PATCH",
          body: JSON.stringify({
            es_activo: !usuario.es_activo,
          }),
        }
      );

      setMensaje(
        `Cuenta ${
          usuario.es_activo
            ? "desactivada"
            : "reactivada"
        } correctamente.`
      );

      await cargar();
    } catch (err) {
      setError(
        err.message ||
          "No fue posible cambiar el estado."
      );
    } finally {
      setOcupado(false);
    }
  }

  const activos = usuarios.filter(
    (usuario) => usuario.es_activo
  ).length;

  const inactivos = usuarios.length - activos;

  return (
    <div className="alimentadores-admin usuarios-app-admin">
      <div className="alimentadores-header">
        <div>
          <h1>Usuarios de la aplicación</h1>
          <p>
            Consulta, edita y administra el acceso
            de los usuarios registrados desde la app.
          </p>
        </div>

        <button
          type="button"
          onClick={cargar}
          disabled={cargando || ocupado}
        >
          Actualizar
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="alimentador-formulario-error"
        >
          {error}
        </p>
      )}

      {mensaje && (
        <p role="status">{mensaje}</p>
      )}

      <div className="alimentadores-resumen">
        <div className="alimentadores-resumen-card">
          <div>
            <span>Total</span>
            <strong>{usuarios.length}</strong>
          </div>
        </div>

        <div className="alimentadores-resumen-card">
          <div>
            <span>Activos</span>
            <strong>{activos}</strong>
          </div>
        </div>

        <div className="alimentadores-resumen-card">
          <div>
            <span>Inactivos</span>
            <strong>{inactivos}</strong>
          </div>
        </div>
      </div>

      <div className="alimentadores-herramientas">
        <input
          aria-label="Buscar usuario"
          placeholder="Buscar por nombre o correo"
          value={busqueda}
          onChange={(event) =>
            setBusqueda(event.target.value)
          }
        />

        <select
          aria-label="Estado"
          value={filtro}
          onChange={(event) =>
            setFiltro(event.target.value)
          }
        >
          <option value="todos">Todos</option>
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
        </select>
      </div>

      <div className="alimentadores-tabla-scroll">
        <table className="alimentadores-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Registrado</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={6}>
                  Cargando cuentas...
                </td>
              </tr>
            ) : filtrados.length ? (
              filtrados.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td>
                    {usuario.nombre}{" "}
                    {usuario.apellidos}
                  </td>

                  <td>{usuario.correo}</td>

                  <td>
                    {usuario.telefono || "—"}
                  </td>

                  <td>
                    {usuario.fecha_registro
                      ? new Date(
                          usuario.fecha_registro
                        ).toLocaleDateString("es-MX")
                      : "—"}
                  </td>

                  <td>
                    {usuario.es_activo
                      ? "Activo"
                      : "Inactivo"}
                  </td>

                  <td>
                    <div className="alimentador-acciones">
                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() =>
                          abrir(usuario)
                        }
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        disabled={ocupado}
                        onClick={() =>
                          cambiarEstado(usuario)
                        }
                      >
                        {usuario.es_activo
                          ? "Desactivar"
                          : "Reactivar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editando && (
        <div className="alimentador-modal-fondo">
          <div
            className="alimentador-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="editar-app-titulo"
          >
            <div className="alimentador-modal-header">
              <h2 id="editar-app-titulo">
                Editar usuario
              </h2>

              <button
                type="button"
                onClick={() => setEditando(null)}
                aria-label="Cerrar"
                disabled={ocupado}
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={guardar}>
              {[
                ["nombre", "Nombre"],
                ["apellidos", "Apellidos"],
                ["correo", "Correo electrónico"],
                ["telefono", "Teléfono (opcional)"],
              ].map(([campo, titulo]) => (
                <div
                  className="alimentador-formulario-campo"
                  key={campo}
                >
                  <label htmlFor={`app-${campo}`}>
                    {titulo}
                  </label>

                  <input
                    id={`app-${campo}`}
                    type={
                      campo === "correo"
                        ? "email"
                        : "text"
                    }
                    required={campo !== "telefono"}
                    minLength={
                      campo === "nombre" ||
                      campo === "apellidos"
                        ? 3
                        : undefined
                    }
                    maxLength={
                      campo === "nombre"
                        ? 30
                        : campo === "apellidos"
                        ? 100
                        : undefined
                    }
                    value={form[campo]}
                    onChange={(event) =>
                      setForm((anterior) => ({
                        ...anterior,
                        [campo]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}

              <div className="alimentador-modal-acciones">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  disabled={ocupado}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={ocupado}
                >
                  {ocupado
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
