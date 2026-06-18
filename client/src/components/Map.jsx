
import mapImage from "../../images/mappa.png";
import mapNoLines from "../../images/mappaStazioni.png";
import { useContext } from "react";
import { UserContext } from "../UserContext.js";
import {useNavigate} from "react-router-dom";

export const GameMap = ({ phase }) => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    const currentMap = phase === 2 ? mapNoLines : mapImage;
    const mapBlurred = phase === 0 && !user;

    return (
        <section className="panel" aria-label="Mappa di gioco">
            <span className="panel-label">Mappa &middot; linee e stazioni</span>
            <div className="map-frame" style={{ position: "relative" }}>
                <img
                    src={currentMap}
                    alt="Mappa della Rete Metropolitana di Valdoria"
                    style={mapBlurred ? { filter: "blur(50px)" } : {}}
                />
                {mapBlurred && (
                    <div className="map-overlay" onClick={() => navigate('/login')}>
                        <span>Accedi per vedere la mappa</span>
                    </div>
                )}
            </div>
        </section>
    );
}