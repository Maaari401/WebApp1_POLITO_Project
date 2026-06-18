
// phase 1
export const PhasePreparation = ({onReady}) => (
    <section className="panel" aria-label="Preparazione">
        <h2 className="rules-header">Fase I: Preparazione</h2>
        <div className="rules-divider"><span></span></div>
        <p className="preparation-text">
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
