import { useCallback, useEffect, useRef, useState } from "react";
import API from "../../api/API.js";

export const PhasePianification = ({ game, stationMap, onSubmit }) => {
    const [routes, setRoutes] = useState([]);
    const [path, setPath] = useState([]);
    const [timeLeft, setTimeLeft] = useState(90);

    const hasSubmitted = useRef(false);
    const pathRef = useRef([]);
    const pathBottomRef = useRef(null);

    useEffect(() => {
        API.getRoutes().then(setRoutes).catch(console.error);
    }, []);

    useEffect(() => {
        pathRef.current = path;
        pathBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [path]);

    const handleSubmit = useCallback((rides) => {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;
        onSubmit({ rides: rides.map(r => ({ from: r.id_station_start, to: r.id_station_end })) });
    }, [onSubmit]);

    useEffect(() => {
        if (timeLeft <= 0) { handleSubmit(pathRef.current); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft, handleSubmit]);

    const sn = (id) => stationMap.get(Number(id)) ?? id;
    const submitted = timeLeft <= 0;

    const usedIds = new Set(path.map(r => r.id));
    const available = routes
        .filter(r => !usedIds.has(r.id))
        .sort((a, b) => sn(a.id_station_start).localeCompare(sn(b.id_station_start)) || sn(a.id_station_end).localeCompare(sn(b.id_station_end)));

    const addRoute = (route) => setPath(prev => [...prev, route]);
    const removeRoute = (id) => setPath(prev => prev.filter(r => r.id !== id));

    return (
        <section className="panel" aria-label="Pianificazione">
            <div className="plan-header">
                <h2 className="rules-header">Fase II: Pianificazione</h2>
                <span className={`plan-timer ${timeLeft <= 10 ? "plan-timer--urgent" : timeLeft <= 30 ? "plan-timer--warning" : ""}`}>
                    {timeLeft}s
                </span>
            </div>
            <div className="plan-progress">
                <div
                    className={`plan-progress-fill ${timeLeft <= 10 ? "plan-progress-fill--urgent" : timeLeft <= 30 ? "plan-progress-fill--warning" : ""}`}
                    style={{ width: `${(timeLeft / 90) * 100}%` }}
                />
            </div>

            <p className="plan-mission">
                <span className="fase-title">Missione</span>
                da <b>{sn(game.start)}</b> a <b>{sn(game.end)}</b>
            </p>

            <div className="plan-path">
                <span className="plan-section-label">Il tuo percorso</span>
                {path.length === 0
                    ? <span className="plan-path-empty">Nessuna tratta selezionata</span>
                    : path.map((r) => (
                        <span key={r.id} className="plan-ride">
                            <span className="plan-ride-label">{sn(r.id_station_start)} → {sn(r.id_station_end)}</span>
                            {!submitted && (
                                <button className="plan-ride-btn plan-ride-btn--delete" onClick={() => removeRoute(r.id)} title="Rimuovi">×</button>
                            )}
                        </span>
                    ))
                }
                <span ref={pathBottomRef} />
            </div>

            {!submitted && (
                <div className="plan-routes-list">
                    <span className="plan-section-label">Tratte disponibili</span>
                    {available.length === 0
                        ? <span className="plan-path-empty">Nessuna tratta disponibile</span>
                        : available.map(r => (
                            <button key={r.id} className="plan-route-item" onClick={() => addRoute(r)}>
                                {sn(r.id_station_start)} — {sn(r.id_station_end)}
                            </button>
                        ))
                    }
                </div>
            )}

            <div className="panel-footer">
                <button className="btn-play-seal" onClick={() => handleSubmit(path)} disabled={submitted}>
                    <span>Conferma</span>
                </button>
            </div>
        </section>
    );
};