import GoogleMap from "../mapa/googleMap";

import "./mapaAlim.css";

function MapaAlim() {

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
                <GoogleMap
                    center={centroAtizapan}
                    zoom={13}
                    reportes={[]}
                />
            </div>
        </div>
    );
}

export default MapaAlim;