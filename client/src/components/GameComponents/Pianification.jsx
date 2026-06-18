import {useEffect, useMemo, useRef, useState} from "react";

// phase 2
export const PhasePianification = ({ game, stationMap, onSubmit }) => {
    const [rides, setRides] = useState([]);
    const [selectedFrom, setSelectedFrom] = useState("");
    const [selectedTo, setSelectedTo] = useState("");
    const [editingIndex, setEditingIndex] = useState(null);
    const [timeLeft, setTimeLeft] = useState(90);
    
    const hasSubmitted = useRef(false);

    const submitted = timeLeft <= 0;

    const edgeKey = (a, b) => `${a}>${b}`;

    const usedEdges = useMemo(() => {
        const set = new Set();
        rides.forEach(r => set.add(edgeKey(r.from, r.to)));
        return set;
    }, [rides]);

    const handleSubmit = (ridesData) => {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;
        onSubmit(ridesData);
    };

    useEffect(() => {
        if (timeLeft <= 0) { handleSubmit({ rides }); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);
    
    const addRide = () => {
        const newRide = { from: Number(selectedFrom), to: Number(selectedTo) };
        if (editingIndex !== null) {
            setRides(prev => prev.map((r, i) => i === editingIndex ? newRide : r));
            setEditingIndex(null);
        } else {
            setRides(prev => [...prev, newRide]);
        }
        setSelectedFrom("");
        setSelectedTo("");
    };
    
    const removeRide = (i) => setRides(prev => prev.filter((_, idx) => idx !== i));
    
    const editRide = (i) => {
        const r = rides[i];
        setEditingIndex(i);
        setSelectedFrom(r.from);
        setSelectedTo(r.to);
    };
    
    const sn = (id) => stationMap.get(Number(id)) ?? id;
    
    const availableDestinations = [...stationMap.entries()].filter(([id]) =>
        !usedEdges.has(edgeKey(selectedFrom, id))
    );
    
    return (
        <section className="panel" aria-label="Pianificazione">
            <div className="plan-header">
                <h2 className="rules-header">Fase II: Pianificazione</h2>
                <span className={`plan-timer ${timeLeft <= 10 ? "plan-timer--urgent" : timeLeft <= 30 ? "plan-timer--warning" : ""}`}>{timeLeft}s</span>
            </div>
            <div className="plan-progress">
                <div
                    className={`plan-progress-fill ${timeLeft <= 10 ? "plan-progress-fill--urgent" : timeLeft <= 30 ? "plan-progress-fill--warning" : ""}`}
                    style={{ width: `${(timeLeft / 90) * 100}%` }}
                />
            </div>
            <div className="rules-divider"><span></span></div>
            
            <p className="plan-mission">
                <span className="fase-title">Missione</span>
                da <strong>{sn(game.start)}</strong> a <strong>{sn(game.end)}</strong>
            </p>
            
            <div className="plan-path">
                {rides.length === 0
                    ? <span className="plan-path-empty">Nessuna tratta selezionata</span>
                    : rides.map((r, i) => (
                        <span key={i} className="plan-ride">
                            <span className="plan-ride-label">{sn(r.from)} → {sn(r.to)}</span>
                            {!submitted && <>
                                <button className="plan-ride-btn" onClick={() => editRide(i)} title="Modifica">✎</button>
                                <button className="plan-ride-btn plan-ride-btn--delete" onClick={() => removeRide(i)} title="Elimina">×</button>
                            </>}
                        </span>
                    ))
                }
            </div>
            
            {!submitted && (
                <div className="plan-picker">
                    <select
                        className="plan-select"
                        value={selectedFrom}
                        onChange={e => { setSelectedFrom(e.target.value); setSelectedTo(""); }}
                    >
                        <option value="">Scegli partenza</option>
                        {[...stationMap.entries()].map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <span className="plan-arrow">→</span>
                    <select
                        className="plan-select"
                        value={selectedTo}
                        onChange={e => setSelectedTo(e.target.value)}
                        disabled={!selectedFrom}
                    >
                        <option value="">Scegli destinazione</option>
                        {availableDestinations.map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <button className="plan-btn-add" onClick={addRide} disabled={!selectedFrom || !selectedTo}>+</button>
                </div>)}
            
            <div className="panel-footer">
                <button className="btn-play-seal" onClick={() => handleSubmit({ rides })} disabled={submitted}>
                    <span>Conferma</span>
                </button>
            </div>
        </section>
    );
};