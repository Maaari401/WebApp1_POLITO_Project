import {useEffect, useRef, useState} from "react";
import API from "../../api/API.js";
// phase 3
export const PhaseJourney = ({ result, stationMap, onContinua, onPlayAgain }) => {
    const [events, setEvents] = useState(null);
    const [rideCount, setRideCount] = useState(1)
    const [coin, setCoin] = useState(20)
    const lastHopRef = useRef(null);
    
    const isValid = result?.valid === true;
    
    useEffect(() => {
        if (!isValid || !result.path?.length) return;
        Promise.all(result.path.map(hop => API.getEvent(hop.event_id)))
            .then(evs => {
                setEvents(evs);
                setCoin(20 + evs[0].bonus);
            })
            .catch(console.error);
    }, [result]);
    
    const handleNextHop = () => {
        const newCount = rideCount + 1;
        setRideCount(newCount);
        setCoin(events.slice(0, newCount).reduce((acc, e) => acc + e.bonus, 20));
    }
    
    useEffect(() => {
        lastHopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [rideCount]);
    
    const sn = (id) => stationMap.get(Number(id)) ?? `#${id}`;
    
    return (
        <section className="panel" aria-label="Il viaggio">
            <h2 className="rules-header">Fase III: Il Viaggio</h2>
            <span className={`plan-timer`}>{isValid && coin}</span>
            <div className="rules-divider"><span></span></div>
            
            {result?.error && (
                <div className="viaggio-invalid">
                    <span className="viaggio-invalid-title">Percorso non valido</span>
                    <p className="viaggio-invalid-reason">hai perso tutte le monete.</p>
                </div>
            )}
            
            {isValid && events && (
                <>
                    <div className="viaggio-list">
                        {result.path.slice(0, rideCount).map((hop, i) => (
                            <div key={i} className="viaggio-hop" ref={i === rideCount - 1 ? lastHopRef : null}>
                                <span className="viaggio-hop-num">{i + 1}</span>
                                <div className="viaggio-hop-body">
                                    <span className="viaggio-hop-route">{sn(hop.from)} → {sn(hop.to)}</span>
                                    <span className="viaggio-event-title">{events[i].title}</span>
                                    <span className="viaggio-event-text">{events[i].text}</span>
                                </div>
                                <span className={`viaggio-hop-bonus ${events[i].bonus >= 0 ? "viaggio-hop-bonus--pos" : "viaggio-hop-bonus--neg"}`}>
                                    {events[i].bonus >= 0 ? "+" : ""}{events[i].bonus}
                                </span>
                            </div>
                        ))}
                    </div>
                    {rideCount < result.path.length && (
                        <button className="btn-next-ride" onClick={handleNextHop}>
                            <span>Prossima tratta</span>
                            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5l8 7-8 7"/></svg>
                        </button>
                    )}
                
                </>
            )}
            <div className="panel-footer">
                {isValid && rideCount === result.path.length && (
                    <button className="btn-play-seal" onClick={onContinua}>
                        <span>Fine</span>
                    </button>
                )}
                {!isValid && (
                    <button className="btn-play-seal" onClick={onPlayAgain}>
                        <span>Rigioca</span>
                    </button>
                )}
            
            </div>
        </section>
    );
};