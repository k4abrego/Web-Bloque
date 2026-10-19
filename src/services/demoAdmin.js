
/**
 * Datos temporales para la presentación de SIPINNA.
 * Nunca envía modificaciones a MariaDB.
 * Solo funciona con VITE_DEMO_ADMIN=true.
 */
const ACTIVO = import.meta.env.VITE_DEMO_ADMIN === "true";
const CLAVE = "sipinna_demo_admin_v1";

const INSTITUCIONES = [
  { id_institucion: 1, nombre: "SIPINNA - Institución de ejemplo", es_activo: true },
  { id_institucion: 2, nombre: "DIF - Institución de ejemplo", es_activo: true },
];

const INICIAL = {
  administradores: [
    { id_usuario: 3, nombre: "Ana", apellidos: "Pérez López", correo: "admin.demo@example.com", telefono: "+525500000001", id_institucion: 1, institucion: INSTITUCIONES[0].nombre, es_activo: true },
    { id_usuario: 11, nombre: "Daniela", apellidos: "Martínez Ruiz", correo: "daniela.demo@example.com", telefono: "+525500000002", id_institucion: 1, institucion: INSTITUCIONES[0].nombre, es_activo: true },
    { id_usuario: 12, nombre: "Carlos", apellidos: "García Torres", correo: "carlos.demo@example.com", telefono: "+525500000003", id_institucion: 2, institucion: INSTITUCIONES[1].nombre, es_activo: false },
  ],
  usuarios: [
    { id_usuario: 21, nombre: "Lucía", apellidos: "Ramírez Soto", correo: "lucia.demo@example.com", telefono: "+525500000021", es_activo: true, fecha_registro: "2026-10-16" },
    { id_usuario: 22, nombre: "Emiliano", apellidos: "López Díaz", correo: "emiliano.demo@example.com", telefono: "+525500000022", es_activo: true, fecha_registro: "2026-10-17" },
    { id_usuario: 23, nombre: "Mariana", apellidos: "Flores Ríos", correo: "mariana.demo@example.com", telefono: "+525500000023", es_activo: false, fecha_registro: "2026-10-18" },
  ],
};

function leer() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) || structuredClone(INICIAL);
  } catch {
    return structuredClone(INICIAL);
  }
}

function guardar(datos) {
  localStorage.setItem(CLAVE, JSON.stringify(datos));
}

export function atenderDemoAdmin(endpoint, options = {}) {
  if (!ACTIVO) return { handled: false };

  const metodo = (options.method || "GET").toUpperCase();
  const ruta = endpoint.split("?")[0];
  const datos = leer();

  let cuerpo = {};
  try { cuerpo = JSON.parse(options.body || "{}"); } catch { /* Sin cuerpo */ }

  if (ruta === "/instituciones" && metodo === "GET") {
    return { handled: true, result: INSTITUCIONES };
  }

  if (ruta === "/admin/usuarios-app" && metodo === "GET") {
    return { handled: true, result: { usuarios: datos.usuarios } };
  }

  let coincidencia = ruta.match(/^\/admin\/usuarios-app\/(\d+)(\/estado)?$/);
  if (coincidencia && metodo === "PATCH") {
    const usuario = datos.usuarios.find(x => x.id_usuario === Number(coincidencia[1]));
    if (!usuario) throw new Error("Usuario de demostración no encontrado.");
    if (coincidencia[2]) {
      usuario.es_activo = Boolean(cuerpo.es_activo);
    } else {
      Object.assign(usuario, {
        nombre: cuerpo.nombre,
        apellidos: cuerpo.apellidos,
        correo: cuerpo.correo,
        telefono: cuerpo.telefono,
      });
    }
    guardar(datos);
    return { handled: true, result: { ok: true } };
  }

  if (ruta === "/admin/administradores" && metodo === "GET") {
    return { handled: true, result: datos.administradores };
  }

  if (/^\/Registrar\/Admin\/\d+$/.test(ruta) && metodo === "POST") {
    const nuevo = cuerpo.new_admin || {};
    const id = Math.max(...datos.administradores.map(x => x.id_usuario), 12) + 1;
    const institucion = INSTITUCIONES.find(
      x => x.id_institucion === Number(cuerpo.institution_id)
    );
    datos.administradores.push({
      id_usuario: id,
      nombre: nuevo.name,
      apellidos: nuevo.surname,
      correo: nuevo.email,
      telefono: nuevo.phone_number,
      id_institucion: institucion?.id_institucion || 1,
      institucion: institucion?.nombre || INSTITUCIONES[0].nombre,
      es_activo: true,
    });
    guardar(datos);
    return { handled: true, result: { user_id: id } };
  }

  coincidencia = ruta.match(/^\/admin\/administradores\/(\d+)(\/estado)?$/);
  if (coincidencia && metodo === "PATCH") {
    const admin = datos.administradores.find(x => x.id_usuario === Number(coincidencia[1]));
    if (!admin) throw new Error("Administrador de demostración no encontrado.");
    if (coincidencia[2]) {
      if (admin.id_usuario === 3 && !cuerpo.es_activo) {
        throw new Error("La cuenta principal está protegida.");
      }
      admin.es_activo = Boolean(cuerpo.es_activo);
    } else {
      const institucion = INSTITUCIONES.find(
        x => x.id_institucion === Number(cuerpo.institution_id)
      );
      Object.assign(admin, {
        nombre: cuerpo.nombre,
        apellidos: cuerpo.apellidos,
        correo: cuerpo.correo,
        telefono: cuerpo.telefono,
        id_institucion: institucion?.id_institucion || admin.id_institucion,
        institucion: institucion?.nombre || admin.institucion,
      });
    }
    guardar(datos);
    return { handled: true, result: { ok: true } };
  }

  return { handled: false };
}
