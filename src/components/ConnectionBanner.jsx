import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import "./ConnectionBanner.css";

/**
 * Muestra el estado actual de conexión del navegador.
 *
 * El componente escucha los eventos online/offline del navegador
 * y muestra un aviso visual cuando no existe conexión.
 *
 * @returns {JSX.Element|null} Aviso de conexión o null cuando
 * la conexión se encuentra disponible.
 */
function ConnectionBanner() {
    const [sinConexion, setSinConexion] = useState(!navigator.onLine);

    useEffect(() => {
        /**
         * Actualiza el estado cuando el navegador recupera
         * o pierde la conexión.
         */
        const manejarConexion = () => {
            setSinConexion(!navigator.onLine);
        };

        window.addEventListener("online", manejarConexion);
        window.addEventListener("offline", manejarConexion);

        return () => {
            window.removeEventListener("online", manejarConexion);
            window.removeEventListener("offline", manejarConexion);
        };
    }, []);

    if (!sinConexion) {
        return null;
    }

    return (
        <div className="connection-banner" role="alert">
            <WifiOff size={18} />

            <div>
                <strong>Sin conexión</strong>
                <span>
                    No tienes conexión a Internet. Algunas funciones pueden no estar disponibles.
                </span>
            </div>
        </div>
    );
}

export default ConnectionBanner;