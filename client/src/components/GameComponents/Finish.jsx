import {LeaderBoard} from "../LeaderBoard.jsx";

// phase 4
export const PhaseFinish = ({result, onPlayAgain }) => (
    
    <section className="panel" aria-label="Traguardo">
        <h2 className="rules-header">Traguardo</h2>
        <div className="viaggio-summary">
            <span className="viaggio-summary-label">Monete finali</span>
            <span className="viaggio-summary-coins">{result?.coin}</span>
        </div>
        <LeaderBoard small={true}/>
        <div className="panel-footer">
            <button className="btn-play-seal" onClick={onPlayAgain}>
                <span>Gioca Ancora</span>
            </button>
        </div>
    </section>
);