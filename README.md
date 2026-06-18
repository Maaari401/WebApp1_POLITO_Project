[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/iZes9Qfg)
# Exam #1: "Ultima Corsa"
## Student: s355035 Marinari Alessandro Cesare Edoardo

## React Client Application Routes

- Route `/`: home page e game page, dove effettivamente risiede il gioco con anche le sue regole
- Route `/login`: pagina di login
- Route `/registration`: pagina di registrazione
- Route `/leaderBoard`: pagina con la classifica globale degli utenti.
- Route `/userDetails`: pagina con la cronoistoria delle partite effettuate dall'utente loggato.
## API Server

- GET `/api/sessions/current`
  - request parameters: cookie di sessione (Passport)
  - response body: dati utente `{ id, username, email, firstname, lastname, date }`
  - response code:
    - 200 già autenticato
    - 401 non autenticato

- POST `/api/sessions`
  - request body: `{ username, password }`
  - response body: dati utente o messaggio di errore
  - response code:
    - 201 OK, login effettuato
    - 401 credenziali errate

- DELETE `/api/sessions/current`
  - request parameters: cookie di sessione (Passport)
  - response body: nessuno
  - response code:
    - 200 logout effettuato
    - 401 non autenticato

- POST `/api/users`
  - request body: `{ username, password, firstname, lastname, email, birth_date }`
  - response body: dati utente creato o messaggio di errore
  - response code:
    - 201 registrazione effettuata
    - 422 dati utente non validi
    - 503 errore interno

- GET `/api/station/:id`
  - request parameters: `id` (intero) della stazione; cookie di sessione
  - response body: `{ id, name }` o messaggio di errore
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 422 id non valido
    - 503 errore interno

- GET `/api/stations`
  - request parameters: cookie di sessione
  - response body: array di `{ id, name }` o messaggio di errore
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 503 errore interno

- GET `/api/event/:id`
  - request parameters: `id` (intero) dell'evento; cookie di sessione
  - response body: `{ id, title, text, bonus }` o messaggio di errore
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 422 id non valido
    - 503 errore interno

- GET `/api/routes`
  - request parameters: cookie di sessione
  - response body: array di `{ id, id_station_start, id_station_end }` o messaggio di errore
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 503 errore interno

- GET `/api/game_result_player/:id`
  - request parameters: `id` del giocatore (deve corrispondere all'utente loggato); cookie di sessione
  - response body: array di `{ id, player_id, coin, id_station_start, id_station_end, started_at }` o messaggio di errore
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 403 id del giocatore non corrisponde all'utente loggato
    - 503 errore interno

- GET `/api/leaderBoard`
  - request parameters: cookie di sessione
  - response body: array di `{ id, player_id, coin, id_station_start, id_station_end, started_at, username }` ordinato per coin DESC; un record per giocatore (il migliore punteggio)
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 503 errore interno

- GET `/api/game/:id/rides`
  - request parameters: `id` (intero) della partita; cookie di sessione
  - response body: array di `{ from, to, event_id }` corrispondenti alle tappe percorse
  - response code:
    - 200 OK
    - 401 non autorizzato
    - 422 id non valido
    - 503 errore interno

- POST `/api/game/start`
  - request parameters: cookie di sessione
  - response body: `{ game_id, start, end }` con stazione di partenza e arrivo assegnate casualmente
  - response code:
    - 201 partita creata
    - 401 non autorizzato
    - 500 nessuna coppia start/end valida nella rete
    - 503 errore interno

- POST `/api/game/submit`
  - request body: `{ game_id, path }` dove `path` è un array di `{ from, to }`
  - response body: `{ valid, coin, path }` se valido; `{ valid, error }` se non valido (coin salvato come -1)
  - response code:
    - 200 OK (sia valido che non valido)
    - 401 non autorizzato
    - 503 errore interno

## Database Tables

- Table `user` - contains id (PK), username, password, email, firstname, lastname, birth_date, salt (usato per la cifratura)
- Table `station` - contains id (PK), name
- Table `route` - contains id (PK), id_station_start (id stazione di partenza della tratta), id_station_end (id stazione di arrivo della tratta)
- Table `event` - contains id (PK), title, text (descrizione dell'evento), bonus (valore attribuito all'evento `[-4;+4]`)
- Table `game_result` - contains id (PK), player_id (id dell'utente), coin (risultato della partita), id_station_start (id stazione di partenza della partita), id_station_end (id stazione di arrivo della partita), started_at (data al secondo dell'inizio della partita)
- Table `game_ride` - contains id (PK), game_result_id (id della partita), from_station (id stazione della tratta partenza), to_station (id stazione della tratta destinazione), event_id (id evento accaduto durante la tratta), ride_order (ordine della tratta)

NOTA:
- la tabella `route` contiene i collegamenti reali tra le stazioni, non le possibili partite predisposte (vengono calcolate da una funzione per ogni partita)
- la tabella `game_ride` contiene le singole tratte selezionate dall'utente con l'aggiunta dell'evento avvenuto, così si ha già la predisposizione per un eventuale dettaglio della partita.

## Main React Components

- `App` (in `App.jsx`): radice dell'applicazione; gestisce lo stato globale dell'utente autenticato tramite `UserContext` e definisce le route React Router.
- `Navbar` (in `components/Navbar.jsx`): barra di navigazione superiore; mostra il titolo, i pulsanti Login/Logout e LeaderBoard in base allo stato di autenticazione, e l'avatar che porta a UserDetails.
- `Game` (in `components/Game.jsx`): contiene il flusso di gioco; gestisce le fasi (0–4) e passa i dati alle sotto-fasi (sotto componenti) tramite props.
- `GameMap` (in `components/Map.jsx`): visualizza la mappa della rete metropolitana; nella fase di pianificazione mostra la versione senza linee, altrimenti quella completa. Se l'utente non è loggato, oscura la mappa e invita l'utente ad accedere.
- `PhaseRules` (in `components/GameComponents/Rules.jsx`): fase 0 — mostra le regole del gioco e il pulsante per iniziare.
- `PhasePreparation` (in `components/GameComponents/Preparation.jsx`): fase 1 — invita l'utente a studiare la mappa prima di avviare la partita con l'opportuno bottone "Parti".
- `PhasePianification` (in `components/GameComponents/Pianification.jsx`): fase 2 — timer da 90 secondi; permette di costruire il percorso aggiungendo, modificando o rimuovendo tratte (ogni tratta è usa e getta). Allo scadere del tempo o alla conferma manuale invia il percorso al server.
- `PhaseJourney` (in `components/GameComponents/Journey.jsx`): fase 3 — mostra le tratte percorse una alla volta, con l'evento casuale e la variazione di monete tappa per tappa. Se il percorso non è valido mostra l'opportuno messaggio.
- `PhaseFinish` (in `components/GameComponents/Finish.jsx`): fase 4 — mostra il punteggio finale e la classifica degli utenti; permettendo di ritornare alla fase 0.
- `LeaderBoard` (in `components/LeaderBoard.jsx`): tabella con il miglior risultato di ogni giocatore, ordinata per monete edevinziando, se presente, l'utente loggato.
- `LeaderBoardSection` (in `components/LeaderBoard.jsx`): pagina completa della classifica; mostra `GameMap` e `LeaderBoard`; accessibile solo agli utenti loggati.
- `UserDetails` (in `components/UserDetails.jsx`): pagina del profilo utente; mostra la mappa e lo storico completo delle partite tramite `GameHistory`.
- `GameHistory` (in `components/UserDetails.jsx`): tabella con tutte le partite dell'utente loggato (data, stazione di partenza/arrivo, monete); le partite non valide sono indicate come "Non Valido".
- `Login` (in `components/Login.jsx`): form di accesso con username e password; in caso di successo aggiorna il contesto utente e reindirizza a UserDetails.
- `Register` (in `components/Register.jsx`): form di registrazione con validazione lato client (username, password, firstname, lastname, email, data di nascita); in caso di successo reindirizza al login.

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- PieRed / piered
- Maaari401 / alepwd
- Greengio / giopwd

## Use of AI Tools
Per questo progetto sono state utilizzate 2 AI.
- Claude.ai: Utilizzato per `spiegare alcuni concetti` i quali non mi erano chiari come il Route e Context; `debuggin` e anche `refractoring` del codice per uniformalo e renderlo facile da mantenere.
- Gemini: per la creazione delle immagini (SVG e PNG).

Il codide modificato dal qualsiasi agente è stato accuratamente **analizzato** e **studiato** in ogni sua parte prima di essere riportato all'interno del progetto.