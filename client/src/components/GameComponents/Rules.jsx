
// phase 0
export const PhaseRules = ({ onGioca }) => (
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
                <span>Gioca</span>
            </button>
        </div>
    </section>
);