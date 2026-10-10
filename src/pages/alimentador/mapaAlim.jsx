// Documentación automática de src/pages/alimentador/mapaAlim.jsx: Página y estilos de la sección mapaAlim.
import GoogleMap from "../mapa/googleMap";

import "./mapaAlim.css";

// Sección: MapaAlim.
function MapaAlim() {

// Sección: centroAtizapan.
    const centroAtizapan = {
        lat: 19.557,
        lng: -99.271,
    };

    return (
        <div className="mapa-alim">
            <div className="mapa-alim-header">
                <div>
                    <h1>Mapa de mi municipio</h1>
                    <p>
                        Visualización geográfica de los reportes
                        correspondientes a tu municipio.
                    </p>
                </div>
            </div>


            <div className="mapa-alim-card">
                <div className="mapa-alim-map">
                    <GoogleMap
                        center={centroAtizapan}
                        zoom={13}
                    />
                </div>
            </div>

        </div>
    );
}

export default MapaAlim;