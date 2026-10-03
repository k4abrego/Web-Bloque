import GoogleMap from "../mapa/googleMap";

function MapaCalorAdmin() {
  const centro = {
    lat: 19.557,
    lng: -99.271,
  };


  const reportesPrueba = [
    { id: 1, latitud: 19.5570, longitud: -99.2710, municipio: "Atizapán de Zaragoza", peso: 3 },
    { id: 2, latitud: 19.5575, longitud: -99.2705, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 3, latitud: 19.5565, longitud: -99.2715, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 4, latitud: 19.5580, longitud: -99.2712, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 5, latitud: 19.5568, longitud: -99.2698, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 6, latitud: 19.5558, longitud: -99.2708, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 7, latitud: 19.5572, longitud: -99.2722, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 8, latitud: 19.5583, longitud: -99.2700, municipio: "Atizapán de Zaragoza", peso: 1 },

    //otra zona
    { id: 9, latitud: 19.5650, longitud: -99.2800, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 10, latitud: 19.5655, longitud: -99.2795, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 11, latitud: 19.5645, longitud: -99.2805, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 12, latitud: 19.5660, longitud: -99.2810, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 13, latitud: 19.5638, longitud: -99.2798, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 14, latitud: 19.5652, longitud: -99.2815, municipio: "Atizapán de Zaragoza", peso: 2 },

    //otra zona
    { id: 15, latitud: 19.5480, longitud: -99.2600, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 16, latitud: 19.5485, longitud: -99.2595, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 17, latitud: 19.5475, longitud: -99.2605, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 18, latitud: 19.5490, longitud: -99.2610, municipio: "Atizapán de Zaragoza", peso: 1 },

    //otra zona
    { id: 19, latitud: 19.5500, longitud: -99.2850, municipio: "Atizapán de Zaragoza", peso: 3 },
    { id: 20, latitud: 19.5505, longitud: -99.2845, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 21, latitud: 19.5495, longitud: -99.2855, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 22, latitud: 19.5510, longitud: -99.2852, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 23, latitud: 19.5498, longitud: -99.2838, municipio: "Atizapán de Zaragoza", peso: 2 },
    { id: 24, latitud: 19.5512, longitud: -99.2840, municipio: "Atizapán de Zaragoza", peso: 1 },

    //vista de casos aisladoss
    { id: 25, latitud: 19.5750, longitud: -99.2650, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 26, latitud: 19.5400, longitud: -99.2750, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 27, latitud: 19.5680, longitud: -99.2900, municipio: "Atizapán de Zaragoza", peso: 1 },
    { id: 28, latitud: 19.5450, longitud: -99.2500, municipio: "Atizapán de Zaragoza", peso: 1 },
  ];


  return (
    <div>
      <h1>Mapa de calor</h1>
      <p>
        Visualización geográfica de los reportes registrados.
      </p>
      <GoogleMap
          center={centro}
          zoom={12}
          reportes={reportesPrueba}
      />
    </div>
  );
}

export default MapaCalorAdmin;