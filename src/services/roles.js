
const ALIAS_ROLES = {
  admin: "admin",
  administrador: "admin",
  administrator: "admin",

  alimentador: "alimentador",
  feeder: "alimentador",
  alimentador_procuraduria: "alimentador",
  "alimentador-procuraduria": "alimentador",

  reportante: "reportante",
  reporter: "reportante",
};

export function normalizarRol(rol) {
  if (typeof rol !== "string") {
    return null;
  }

  const valor = rol.trim().toLowerCase().replace(/\s+/g, "_");

  return ALIAS_ROLES[valor] ?? null;
}

export function rutaPorRol(rol) {
  const rutas = {
    admin: "/admin",
    alimentador: "/alimentador",
    reportante: "/reportante",
  };

  return rutas[normalizarRol(rol)] ?? null;
}
