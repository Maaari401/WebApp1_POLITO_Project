import API from "../api/API.js";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext.js";
import mapImage from "../../images/mappa.png";
import {GameMap} from "./Map.jsx";
import {Navigate} from "react-router-dom";


export const LeaderBoard = ({small}) => {
    const { user } = useContext(UserContext);
    const [scores, setScores] = useState([]);
    const [stationMap, setStationMap] = useState(new Map());
    
    
    useEffect(() => {
        API.getLeaderboard()
            .then(setScores)
            .catch(console.error);
    }, []);
    

    const medalClass = (i) => {
        if (i === 0) return "lb-medal lb-medal--gold";
        if (i === 1) return "lb-medal lb-medal--silver";
        if (i === 2) return "lb-medal lb-medal--bronze";
        return "lb-rank";
    };
    
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
    
    
    return (
        <div className="leaderboard">
            <h3 className="leaderboard-title">Classifica</h3>
            <div className="rules-divider"><span></span></div>
            {scores.length === 0 ? (
                <p className="lb-empty">Nessuna partita registrata.</p>
            ) : (
                <div className="lb-scroll" style={small ? { maxHeight: "45vh" } : undefined}>
                    <table className="lb-table">
                        <thead>
                            <tr>
                                <th className="lb-th lb-th--rank">#</th>
                                <th className="lb-th">Giocatore</th>
                                <th className="lb-th">Stazione Partenza</th>
                                <th className="lb-th">Stazione Arrivo</th>
                                <th className="lb-th lb-th">Monete</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scores.map((s, i) => {
                                const isCurrent = user && s.player_id === user.id;
                                return (
                                    <tr key={s.player_id} className={`lb-row${isCurrent ? " lb-row--current" : ""}`}>
                                        <td className="lb-td lb-td--rank">
                                            <span className={medalClass(i)}>{i + 1}</span>
                                        </td>
                                        <td className="lb-td">
                                            {s.username}
                                            {isCurrent && <span className="lb-you"> · tu</span>}
                                        </td>
                                        <td className="lb-td">{sn(s.id_station_start)}</td>
                                        <td className="lb-td">{sn(s.id_station_end)}</td>
                                        <td className="lb-td">{s.coin}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


export const LeaderBoardSection = () => {
    const { user } = useContext(UserContext);
    if (!user) return <Navigate to="/" />; //can't use navigate bc it cannot be call during the render of the component.

    return (
        <main>
            <GameMap phase={null} />
            <section className="panel" aria-label="Regole">
                <LeaderBoard small={false}/>
            </section>
        </main>
        
    )
}