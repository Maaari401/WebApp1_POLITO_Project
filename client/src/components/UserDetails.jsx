import { useContext, useEffect, useState } from "react";
import dayjs from "dayjs";
import { UserContext } from "../UserContext.js";
import mapImage from "../../images/mappa.png";
import API from "../api/API.js";
import {Navigate} from "react-router-dom";

const GameHistory = ({ player_id }) => {
    const [games, setGames] = useState([]);
    const [stationMap, setStationMap] = useState(new Map());

    useEffect(() => {
        API.getPlayerResults(Number(player_id)).then(setGames).catch(console.error);
    }, []);

    useEffect(() => {
        API.getStations()
            .then(ss => {
                const map = new Map();
                ss.forEach(s => map.set(s.id, s.name));
                setStationMap(map);
            })
            .catch(console.error);
    }, []);

    const sn = (id) => stationMap.get(Number(id)) ?? `#${id}`;

    const fmt = (dt) => dt ? dayjs(dt).format("DD/MM/YYYY") : "—";

    return (
        <div className="leaderboard">
            <h3 className="leaderboard-title">Storico partite</h3>
            <div className="rules-divider"><span></span></div>
            {games.length === 0 ? (
                <p className="lb-empty">Nessuna partita registrata.</p>
            ) : (
                <div className="lb-scroll">
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th className="lb-th lb-th--rank">#</th>
                                <th className="lb-th">Data</th>
                                <th className="lb-th">Partenza</th>
                                <th className="lb-th">Arrivo</th>
                                <th className="lb-th lb-th--coins">Monete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {games.map((g, i) => (
                                <tr key={g.id} className="lb-row">
                                    <td className="lb-td lb-td--rank">
                                        <span className="lb-rank">{i + 1}</span>
                                    </td>
                                    <td className="lb-td">{fmt(g.started_at)}</td>
                                    <td className="lb-td">{sn(g.id_station_start)}</td>
                                    <td className="lb-td">{sn(g.id_station_end)}</td>
                                    <td className="lb-td lb-td--coins">{g.coin >= 0 ? g.coin : "Non Valido"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


export const UserDetails = () => {
    const { user } = useContext(UserContext);

    if (!user) return <Navigate to="/" />; //can't use navigate bc it cannot be call during the render of the component.

    return (
        <main>
            <section className="panel" aria-label="Mappa di gioco">
                <span className="panel-label">Mappa &middot; linee e stazioni</span>
                <div className="map-frame" style={{ position: "relative" }}>
                    <img
                        src={mapImage}
                        alt="Mappa della Rete Metropolitana di Valdoria"
                    />
                </div>
            </section>
            <section className="panel" aria-label="Storico">
                <GameHistory player_id={user.id}/>
            </section>
        </main>
    );
}