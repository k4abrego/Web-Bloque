// Datos temporales utilizados mientras se conecta el sistema con el backend 
const reportesMock = [
    // #1    
  {
    id: 1,
    folio: "REP-001",
    tipo: "Posible situación de violencia",
    fecha: "2026-09-28",
    estado: "Pendiente",
    prioridad: "Alta",
    ubicacion: "Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Urgente"],
    evidencias: [
      {
        id: 1,
        nombre: "evidencia_foto_001.jpg",
        tipo: "Imagen",
        fecha: "2026-09-28",
      },
      {
        id: 2,
        nombre: "documento_reporte_001.pdf",
        tipo: "Documento",
        fecha: "2026-09-28",
      },
    ],
  },

  // #2
  {
    id: 2,
    folio: "REP-002",
    tipo: "Trabajo infantil",
    fecha: "2026-09-27",
    estado: "En proceso",
    prioridad: "Media",
    ubicacion: "Atizapán de Zaragoza",
    alimentador: "Alimentador 01",
    etiquetas: ["Seguimiento"],
    evidencias: [
      {
        id: 3,
        nombre: "evidencia_reporte_002.jpg",
        tipo: "Imagen",
        fecha: "2026-09-27",
      },
    ],
  },

  // #3
  {
    id: 3,
    folio: "REP-003",
    tipo: "Situación de riesgo",
    fecha: "2026-09-26",
    estado: "En proceso",
    prioridad: "Alta",
    ubicacion: "Atizapán de Zaragoza",
    alimentador: "Alimentador 02",
    etiquetas: ["Prioridad alta"],
    evidencias: [
      {
        id: 4,
        nombre: "evidencia_foto_003.jpg",
        tipo: "Imagen",
        fecha: "2026-09-26",
      },
      {
        id: 5,
        nombre: "evidencia_video_003.mp4",
        tipo: "Video",
        fecha: "2026-09-26",
      },
      {
        id: 6,
        nombre: "documento_seguimiento_003.pdf",
        tipo: "Documento",
        fecha: "2026-09-27",
      },
    ],
  },

  // #4
  {
    id: 4,
    folio: "REP-004",
    tipo: "Posible vulneración de derechos",
    fecha: "2026-09-25",
    estado: "Pendiente",
    prioridad: "Media",
    ubicacion: "Zona Centro, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: [],
    evidencias: [],
  },

  {
    id: 5,
    folio: "REP-005",
    tipo: "Situación de riesgo",
    fecha: "2026-09-23",
    estado: "Resuelto",
    prioridad: "Baja",
    ubicacion: "Atizapán de Zaragoza",
    alimentador: "Alimentador 01",
    etiquetas: ["Finalizado"],
    evidencias: [
      {
        id: 7,
        nombre: "evidencia_foto_005.jpg",
        tipo: "Imagen",
        fecha: "2026-09-23",
      },
      {
        id: 8,
        nombre: "documento_cierre_005.pdf",
        tipo: "Documento",
        fecha: "2026-09-24",
      },
    ],
  },

  // #6
  {
    id: 6,
    folio: "REP-006",
    tipo: "Posible situación de violencia",
    fecha: "2026-09-22",
    estado: "Pendiente",
    prioridad: "Alta",
    ubicacion: "Zona Norte, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Urgente", "Revisión"],
    evidencias: [
      {
        id: 9,
        nombre: "evidencia_foto_006.jpg",
        tipo: "Imagen",
        fecha: "2026-09-22",
      },
    ],
  },

  // #7
  {
    id: 7,
    folio: "REP-007",
    tipo: "Trabajo infantil",
    fecha: "2026-09-21",
    estado: "En proceso",
    prioridad: "Alta",
    ubicacion: "Zona Centro, Atizapán de Zaragoza",
    alimentador: "Alimentador 03",
    etiquetas: ["Seguimiento", "Prioridad alta"],
    evidencias: [
      {
        id: 10,
        nombre: "evidencia_video_007.mp4",
        tipo: "Video",
        fecha: "2026-09-21",
      },
      {
        id: 11,
        nombre: "documento_007.pdf",
        tipo: "Documento",
        fecha: "2026-09-21",
      },
    ],
  },
  
  // #8
  {
    id: 8,
    folio: "REP-008",
    tipo: "Posible vulneración de derechos",
    fecha: "2026-09-20",
    estado: "Resuelto",
    prioridad: "Media",
    ubicacion: "Zona Sur, Atizapán de Zaragoza",
    alimentador: "Alimentador 02",
    etiquetas: ["Finalizado"],
    evidencias: [],
  },
  
  // #9
  {
    id: 9,
    folio: "REP-009",
    tipo: "Situación de riesgo",
    fecha: "2026-09-19",
    estado: "Pendiente",
    prioridad: "Baja",
    ubicacion: "Zona Norte, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Revisión"],
    evidencias: [
      {
        id: 12,
        nombre: "evidencia_foto_009.jpg",
        tipo: "Imagen",
        fecha: "2026-09-19",
      },
    ],
  },

  // #10
  {
    id: 10,
    folio: "REP-010",
    tipo: "Posible situación de violencia",
    fecha: "2026-09-18",
    estado: "En proceso",
    prioridad: "Alta",
    ubicacion: "Zona Centro, Atizapán de Zaragoza",
    alimentador: "Alimentador 04",
    etiquetas: ["Urgente", "Seguimiento"],
    evidencias: [
      {
        id: 13,
        nombre: "evidencia_foto_010.jpg",
        tipo: "Imagen",
        fecha: "2026-09-18",
      },
      {
        id: 14,
        nombre: "evidencia_video_010.mp4",
        tipo: "Video",
        fecha: "2026-09-18",
      },
      {
        id: 15,
        nombre: "documento_reporte_010.pdf",
        tipo: "Documento",
        fecha: "2026-09-19",
      },
    ],
  },
  
  // #11
  {
    id: 11,
    folio: "REP-011",
    tipo: "Trabajo infantil",
    fecha: "2026-09-17",
    estado: "Resuelto",
    prioridad: "Media",
    ubicacion: "Zona Sur, Atizapán de Zaragoza",
    alimentador: "Alimentador 01",
    etiquetas: ["Finalizado"],
    evidencias: [
      {
        id: 16,
        nombre: "documento_cierre_011.pdf",
        tipo: "Documento",
        fecha: "2026-09-18",
      },
    ],
  },

  // #12
  {
    id: 12,
    folio: "REP-012",
    tipo: "Situación de riesgo",
    fecha: "2026-09-16",
    estado: "Pendiente",
    prioridad: "Alta",
    ubicacion: "Zona Oriente, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Urgente"],
    evidencias: [
      {
        id: 17,
        nombre: "evidencia_foto_012.jpg",
        tipo: "Imagen",
        fecha: "2026-09-16",
      },
      {
        id: 18,
        nombre: "evidencia_foto_012_02.jpg",
        tipo: "Imagen",
        fecha: "2026-09-16",
      },
    ],
  },

  // #14
  {
    id: 13,
    folio: "REP-013",
    tipo: "Posible vulneración de derechos",
    fecha: "2026-09-15",
    estado: "En proceso",
    prioridad: "Baja",
    ubicacion: "Zona Poniente, Atizapán de Zaragoza",
    alimentador: "Alimentador 03",
    etiquetas: ["Seguimiento"],
    evidencias: [],
  },

  // #15
  {
    id: 14,
    folio: "REP-014",
    tipo: "Posible situación de violencia",
    fecha: "2026-09-14",
    estado: "Resuelto",
    prioridad: "Alta",
    ubicacion: "Zona Norte, Atizapán de Zaragoza",
    alimentador: "Alimentador 04",
    etiquetas: ["Finalizado", "Prioridad alta"],
    evidencias: [
      {
        id: 19,
        nombre: "evidencia_video_014.mp4",
        tipo: "Video",
        fecha: "2026-09-14",
      },
      {
        id: 20,
        nombre: "documento_cierre_014.pdf",
        tipo: "Documento",
        fecha: "2026-09-15",
      },
    ],
  },
  
  // #16
  {
    id: 15,
    folio: "REP-015",
    tipo: "Trabajo infantil",
    fecha: "2026-09-13",
    estado: "Pendiente",
    prioridad: "Media",
    ubicacion: "Zona Centro, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Revisión"],
    evidencias: [
      {
        id: 21,
        nombre: "evidencia_foto_015.jpg",
        tipo: "Imagen",
        fecha: "2026-09-13",
      },
    ],
  },
  
  // #17
  {
    id: 16,
    folio: "REP-016",
    tipo: "Situación de riesgo",
    fecha: "2026-09-12",
    estado: "En proceso",
    prioridad: "Media",
    ubicacion: "Zona Oriente, Atizapán de Zaragoza",
    alimentador: "Alimentador 02",
    etiquetas: ["Seguimiento"],
    evidencias: [
      {
        id: 22,
        nombre: "evidencia_foto_016.jpg",
        tipo: "Imagen",
        fecha: "2026-09-12",
      },
      {
        id: 23,
        nombre: "documento_seguimiento_016.pdf",
        tipo: "Documento",
        fecha: "2026-09-13",
      },
    ],
  },
  
  // #18
  {
    id: 17,
    folio: "REP-017",
    tipo: "Posible vulneración de derechos",
    fecha: "2026-09-11",
    estado: "Pendiente",
    prioridad: "Alta",
    ubicacion: "Zona Sur, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Urgente", "Revisión"],
    evidencias: [
      {
        id: 24,
        nombre: "evidencia_video_017.mp4",
        tipo: "Video",
        fecha: "2026-09-11",
      },
    ],
  },
  
  // #19
  {
    id: 18,
    folio: "REP-018",
    tipo: "Posible situación de violencia",
    fecha: "2026-09-10",
    estado: "En proceso",
    prioridad: "Baja",
    ubicacion: "Zona Poniente, Atizapán de Zaragoza",
    alimentador: "Alimentador 01",
    etiquetas: ["Seguimiento"],
    evidencias: [],
  },

  // #20
  {
    id: 19,
    folio: "REP-019",
    tipo: "Trabajo infantil",
    fecha: "2026-09-09",
    estado: "Resuelto",
    prioridad: "Baja",
    ubicacion: "Zona Norte, Atizapán de Zaragoza",
    alimentador: "Alimentador 03",
    etiquetas: ["Finalizado"],
    evidencias: [
      {
        id: 25,
        nombre: "documento_cierre_019.pdf",
        tipo: "Documento",
        fecha: "2026-09-10",
      },
    ],
  },

  // #21
  {
    id: 20,
    folio: "REP-020",
    tipo: "Situación de riesgo",
    fecha: "2026-09-08",
    estado: "Pendiente",
    prioridad: "Media",
    ubicacion: "Zona Centro, Atizapán de Zaragoza",
    alimentador: "Sin asignar",
    etiquetas: ["Revisión"],
    evidencias: [
      {
        id: 26,
        nombre: "evidencia_foto_020.jpg",
        tipo: "Imagen",
        fecha: "2026-09-08",
      },
      {
        id: 27,
        nombre: "evidencia_video_020.mp4",
        tipo: "Video",
        fecha: "2026-09-08",
      },
      {
        id: 28,
        nombre: "documento_reporte_020.pdf",
        tipo: "Documento",
        fecha: "2026-09-09",
      },
    ],
  },
];


/* Permite utilizar estos datos temporales en las diferentes páginas */
export default reportesMock;