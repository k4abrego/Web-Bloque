import GoogleMap from "../mapa/googleMap";

function MapaCalorAdmin() {
  const centro = {
    lat: 19.557,
    lng: -99.271,
  };


  const reportes = [
  {
    id: 1,
    latitud: 19.557,
    longitud: -99.271,
    municipio: "Atizapán de Zaragoza",
    peso: 1,
  },
  {
    id: 2,
    latitud: 19.560,
    longitud: -99.268,
    municipio: "Atizapán de Zaragoza",
    peso: 1,
  },
  {
    id: 3,
    latitud: 19.555,
    longitud: -99.275,
    municipio: "Atizapán de Zaragoza",
    peso: 1,
  },
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
          reportes={reportes}
      />
    </div>
  );
}

export default MapaCalorAdmin;