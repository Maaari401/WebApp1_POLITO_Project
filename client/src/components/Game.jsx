import {use, useContext, useEffect, useMemo, useState} from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App.jsx";
import API from "../api/api.js";
import mapImage from "../../images/mappa.png";
import mapNoLines from "../../images/mappaStazioni.png";

// phase 0 — regole
const PhaseRules = ({ onGioca }) => (
    <section className="panel" aria-label="Regole">
        <h2 className="rules-header">Regole</h2>
        <div className="rules-divider"><span></span></div>
        <ul className="rules-list">
            <li>
                <span className="num">I</span>
                <div>
                    <span className="fase-title">Preparazione del viaggio</span>
                    Parti con 20 monete. Studia la rete nella sua interezza — stazioni, collegamenti e linee sono tutti visibili. Prenditi il tempo che serve, poi dai inizio al viaggio.
                </div>
            </li>
            <li>
                <span className="num">II</span>
                <div>
                    <span className="fase-title">Pianificazione del percorso</span>
                    Hai 90 secondi. La mappa cambia: le linee scompaiono, restano solo le stazioni e l'elenco delle tratte. Ti vengono assegnate una partenza e un arrivo distanti almeno 3 tratte. Traccia il percorso scegliendo le tratte una alla volta — ogni tratta scelta è bruciata. Allo scadere del tempo il percorso viene confermato automaticamente.
                </div>
            </li>
            <li>
                <span className="num">III</span>
                <div>
                    <span className="fase-title">Il viaggio</span>
                    Se il percorso è valido, il viaggio comincia: ad ogni tratta la sorte estrae un evento casuale che modifica il tuo tesoro. Se il percorso non è valido — o incompleto — perdi tutte le monete.
                </div>
            </li>
            <li>
                <span className="num">IV</span>
                <div>
                    <span className="fase-title">Traguardo</span>
                    Viene rivelato il punteggio finale: le monete rimaste. Il minimo registrato è zero. Puoi ritirarti o intraprendere subito una nuova corsa.
                </div>
            </li>
        </ul>
        <div className="panel-footer">
            <button className="btn-play-seal" onClick={onGioca}>
                <svg className="gear-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zm9.4 3.5c0 .66-.06 1.3-.16 1.92l2.05 1.6-2 3.46-2.42-.98c-.99.86-2.16 1.5-3.43 1.86L15 22h-4l-.44-2.64c-1.27-.36-2.44-1-3.43-1.86l-2.42.98-2-3.46 2.05-1.6A8.6 8.6 0 0 1 2.6 12c0-.66.06-1.3.16-1.92L.71 8.48l2-3.46 2.42.98C6.12 5.14 7.29 4.5 8.56 4.14L9 1.5h4l.44 2.64c1.27.36 2.44 1 3.43 1.86l2.42-.98 2 3.46-2.05 1.6c.1.62.16 1.26.16 1.92z"/>
                </svg>
                <span>Gioca</span>
            </button>
        </div>
    </section>
);

// phase 1 — preparazione: mappa completa visibile, bottone per iniziare
const PhasePreparazione = ({ game, onReady }) => (
    <section className="panel" aria-label="Preparazione">
        <h2 className="rules-header">Fase I: Preparazione</h2>
        <div className="rules-divider"><span></span></div>
        <p style={{ fontFamily: "'EB Garamond', serif", fontSize: "1.05rem", lineHeight: 1.6 }}>
            Studia bene la mappa. Ti verrà assegnata una stazione di partenza e una di arrivo e dovrai collegarle! <br />
            Quando sei pronto, dai inizio al viaggio.
        </p>
        <div className="panel-footer">
            <button className="btn-play-seal" onClick={onReady}>
                <span>Parti</span>
            </button>
        </div>
    </section>
);
/*
// phase 2 — pianificazione
const PhasePianificazione = ({ game, onSubmit }) => {
    const [routes, setRoutes] = useState([]);
    const [stationMap, setStationMap] = useState([]);
    
    const [rides, setRides] = useState([]);
    
    
    const [allRoutes, setAllRoutes] = useState(null);
    const [selectedTo, setSelectedTo] = useState(null)
    const [selectedFrom, setSelectedFrom] = useState(null)
    
    
    
    const [timeLeft, setTimeLeft] = useState(90);
    
    const submitted = timeLeft <= 0;

    const currentFrom = rides.length > 0 ? rides[rides.length - 1].to : game.start;

    useEffect(() => {
        Promise.all([API.getRoutes(), API.getStations()])
            .then(([rs, ss]) => {
                setRoutes(rs);
                const map = {};
                ss.forEach(s => { map[s.id] = s.name; });
                setStationMap(map);
                const matrix = {};
                for (const i of stationMap) {
                    matrix[i] = {};
                    for (const j of stationMap) {
                        matrix[i][j] = false; // di default: nessun collegamento reale
                    }
                }
                setAllRoutes(matrix);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (timeLeft <= 0) { onSubmit({ rides }); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);
    
    const addRide = () => {
        setRides(prev => [...prev, { from: selectedFrom, to: selectedTo }]);
        setSelectedTo("");
    };
    

    const sn = (id) => stationMap[id] ?? id;
    //TODO ADD DATA SELECT DINAMICALLY ---> GUARDA CLAUDE CHE NE SA.
    return (
        <section className="panel" aria-label="Pianificazione">
            <div className="plan-header">
                <h2 className="rules-header">Fase II: Pianificazione</h2>
                <span className={`plan-timer ${timeLeft <= 10 ? "plan-timer--urgent" : ""}`}>{timeLeft}s</span>
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
                            {sn(r.from)} → {sn(r.to)}
                        </span>
                    ))
                }
            </div>

            {!submitted && (
                <div className="plan-picker">
                    <select
                        className="plan-select"
                        value={selectedTo}
                        onChange={e => setSelectedTo(e.target.value)}
                    >
                        <option value="">Scegli partenza</option>
                        {Object.entries(stationMap).map(([id, name]) => (
                            <option key={id} value={id}>{name}</option>
                        ))}
                    </select>
                    <span className="plan-arrow">→</span>
                    <select
                        className="plan-select"
                        value={selectedFrom}
                        onChange={e => setSelectedFrom(e.target.value)}
                    >
                        <option value="">Scegli destinazione</option>
                        {Object.entries(stationMap).map(([id, name]) => {
                            if (!allRoutes.get(selectedFrom)?.includes(id)) return null;
                            return <option key={id} value={id}>{name}</option>;
                        })}
                    </select>
                    <button className="plan-btn-add" onClick={addRide} disabled={!selectedTo}>+</button>
                </div>)}

            <div className="panel-footer">
                <button className="btn-play-seal" onClick={() => onSubmit({ rides })} disabled={submitted}>
                    <span>Conferma</span>
                </button>
            </div>
        </section>
    );
};*/

const PhasePianificazione = ({ game, onSubmit }) => {
    const [stationMap, setStationMap] = useState({});
    const [rides, setRides] = useState([]);
    const [selectedFrom, setSelectedFrom] = useState("");
    const [selectedTo, setSelectedTo] = useState("");
    const [timeLeft, setTimeLeft] = useState(90);
    
    const submitted = timeLeft <= 0;
    
    // tratta direzionale: a->b è diversa da b->a
    const edgeKey = (a, b) => `${a}>${b}`;
    
    const usedEdges = useMemo(() => {
        const set = new Set();
        rides.forEach(r => set.add(edgeKey(r.from, r.to)));
        return set;
    }, [rides]);
    
    useEffect(() => {
        API.getStations()
            .then(ss => {
                const map = {};
                ss.forEach(s => { map[s.id] = s.name; });
                setStationMap(map);
            })
            .catch(console.error);
    }, []);
    
    useEffect(() => {
        if (timeLeft <= 0) { onSubmit({ rides }); return; }
        const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearTimeout(t);
    }, [timeLeft]);
    
    const addRide = () => {
        setRides(prev => [...prev, { from: selectedFrom, to: selectedTo }]);
        setSelectedFrom("");
        setSelectedTo("");
    };
    
    const sn = (id) => stationMap[id] ?? id;
    
    // unico vincolo: la tratta esatta (selectedFrom -> id) non deve
    // essere già stata usata. Il percorso inverso resta sempre valido.
    const availableDestinations = Object.entries(stationMap).filter(([id]) =>
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
                        <span key={i} className="plan-ride">{sn(r.from)} → {sn(r.to)}</span>
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
                        {Object.entries(stationMap).map(([id, name]) => (
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
                <button className="btn-play-seal" onClick={() => onSubmit({ rides })} disabled={submitted}>
                    <span>Conferma</span>
                </button>
            </div>
        </section>
    );
};

// phase 3 — viaggio: stub
const PhaseViaggio = () => (
    <section className="panel" aria-label="Il viaggio">
        <h2 className="rules-header">Il viaggio</h2>
        <div className="rules-divider"><span></span></div>
        {/* TODO: eventi tratta per tratta */}
    </section>
);

// phase 4 — traguardo: stub
const PhaseTraguardo = ({ onRigioca }) => (
    <section className="panel" aria-label="Traguardo">
        <h2 className="rules-header">Traguardo</h2>
        <div className="rules-divider"><span></span></div>
        {/* TODO: punteggio finale */}
        <div className="panel-footer">
            <button className="btn-play-seal" onClick={onRigioca}>
                <span>Ancora</span>
            </button>
        </div>
    </section>
);

export const Game = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);

    const gameStarted = phase > 0;

    const handleGioca = () => {
        if (!user) { navigate("/login"); return; }
        setPhase(1)
    };
    
    const handlePianification = async () => {
        if (!user) { navigate("/login"); return; }
        try {
            const g = await API.startGame();
            setGame(g);
            setPhase(2);
        } catch (err) {
            console.error(err);
        }
    }

    // mappa con linee in fase 0-1, senza linee in fase 2+
    const currentMap = phase >= 2 ? mapNoLines : mapImage;
    const mapBlurred = !gameStarted && !user;

    return (
        <main>
            <section className="panel" aria-label="Mappa di gioco">
                <span className="panel-label">Mappa &middot; linee e stazioni</span>
                <div className="map-frame" style={{ position: "relative" }}>
                    <img
                        src={currentMap}
                        alt="Mappa della Rete Metropolitana di Valdoria"
                        style={mapBlurred ? { filter: "blur(50px)" } : {}}
                    />
                    {mapBlurred && (
                        <div className="map-overlay">
                            <span>Accedi per vedere la mappa</span>
                        </div>
                    )}
                </div>
            </section>

            {phase === 0 && <PhaseRules onGioca={handleGioca} />}
            {phase === 1 && <PhasePreparazione onReady={() => handlePianification()} />}
            {phase === 2 && <PhasePianificazione game={game} onSubmit={async (path) => {
                try {
                    const res = await API.submitGame(game.game_id, path);
                    setResult(res);
                    setPhase(3);
                } catch (err) {
                    console.error(err);
                    setPhase(3);
                }
            }} />}
            {phase === 3 && <PhaseViaggio />}
            {phase === 4 && <PhaseTraguardo onRigioca={() => { setGame(null); setPhase(0); }} />}
        </main>
    );
};