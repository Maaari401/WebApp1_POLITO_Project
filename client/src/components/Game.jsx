import {useContext, useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext.js"
import API from "../api/API.js";
import {PhaseRules} from "./GameComponents/Rules.jsx";
import {PhasePreparation} from "./GameComponents/Preparation.jsx";
import {PhasePianification} from "./GameComponents/Pianification.jsx";
import {PhaseFinish} from "./GameComponents/Finish.jsx";
import {PhaseJourney} from "./GameComponents/Journey.jsx";
import {GameMap} from "./Map.jsx";


const ErrorText = ({ message, onDismiss }) => (
    <div className="game-error">
        <span className="game-error-text">E' comparso un errore, riprovare più tardi</span>
        <span className="game-error-text">({message})</span>
        <button className="game-error-dismiss" onClick={onDismiss}>×</button>
    </div>
);

export const Game = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [phase, setPhase] = useState(0);
    const [game, setGame] = useState(null);
    const [result, setResult] = useState(null);
    const [stationMap, setStationMap] = useState(new Map());
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!user) return;
        API.getStations()
            .then(ss => {
                const map = new Map();
                ss.forEach(s => map.set(s.id, s.name));
                setStationMap(map);
            })
            .catch((err)=> {
                setError(err);
                console.error(err);
            });
    }, [user]);
    
    /*
    useEffect(() => {
        if (!user) {
            setPhase(0);
            setGame(null);
            setResult(null);
        }
    }, [user]);*/

    const handlePlayButton = () => {
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
            setError(err.message);
        }
    }
    
    const handleSubmitPianification = async (path) => {
        try {
            const res = await API.submitGame(game.game_id, path);
            setResult(res);
            setPhase(3);
        } catch (err) {
            setError(err.message);
        }
    }
    const handleRigioca = () => { setGame(null); setResult(null); setPhase(0); }


    return (
        <main>
            <GameMap phase={phase} />

            {phase === 0 && <PhaseRules onGioca={handlePlayButton} />}
            {phase === 1 && <PhasePreparation onReady={() => handlePianification()} />}
            {phase === 2 && <PhasePianification game={game} stationMap={stationMap} onSubmit={handleSubmitPianification} />}
            {phase === 3 && <PhaseJourney result={result} stationMap={stationMap} onContinua={() => setPhase(4)} onPlayAgain={handleRigioca}/>}
            {phase === 4 && <PhaseFinish result={result} onPlayAgain={handleRigioca} />}
            
            {error && <ErrorText message={error} onDismiss={() => {
                setError(null);
                setPhase(0);
                setGame(null);
                setResult(null);
            }} />}
        </main>
    );
};