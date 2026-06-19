
import sqlite from "sqlite3";
import crypto from "crypto";
import {Station, User, Event, Route, Game_Result, Ride_with_event} from "./models.js";
import dayjs from "dayjs";

const db = new sqlite.Database("UltimaCorsa.sqlite", (err) => {
    if (err) throw err;
});
const PLAYTIME = 90;
const COIN_BASE = 20;



/* USERS */
export const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM user WHERE username = ?";
        db.get(sql, [username], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row === undefined) {
                resolve(false);
            }
            else {
                const user = new User(row.id, row.username, row.email, row.firstname, row.lastname, row.birth_date);
                
                crypto.scrypt(password, row.salt, 64, function(err, hashedPassword) {
                    if (err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, "hex"), hashedPassword))
                        resolve(false);
                    else
                        resolve(user);
                });
            }
        });
    });
};

export const createUser = (username, password, firstname, lastname, birth_date, email) => {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex");
        crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
            if (err) reject(err);

            const sql = "INSERT INTO user (username, password, firstname, lastname, birth_date, email, salt) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.run(sql, [username, hashedPassword.toString("hex"), firstname, lastname, birth_date, email, salt], function (err) {
                if (err) reject(err);
                else resolve( new User(this.lastID, username, email, firstname, lastname, birth_date));
            });
        });
    });
};


/* STATIONS */
export const getStations = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM station ORDER BY name ASC";
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Station(row.id, row.name)));
            }
        });
    });
}

export const getStationById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM station WHERE id = ?";
        db.get(sql, [Number(id)], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            } else {
                resolve(new Station(row.id, row.name));
            }
        });
    });
}

/* EVENTS */
export const getEventById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM event WHERE id = ?";
        db.get(sql, [Number(id)], (err, row) => {
            if (err) {
                reject(err);
            } else if (row === undefined) {
                resolve(false);
            } else {
                resolve(new Event(row.id, row.title, row.text, row.bonus));
            }
        });
    });
}

export const getRandomEvents = (n) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM event ORDER BY RANDOM() LIMIT ?";
        db.all(sql, [n], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => new Event(r.id, r.title, r.text, r.bonus)));
        });
    });
}

/* GAME RESULTS */
export const getPlayerResults = (player_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM game_result WHERE player_id = ?";
        db.all(sql, [player_id], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Game_Result(row.id, row.player_id, row.coin, row.id_station_start, row.id_station_end, row.started_at)));
            }
        });
    });
}

export const addResult = (player_id, coin, id_station_start, id_station_end, started_at) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO game_result (player_id, coin, id_station_start, id_station_end, started_at) VALUES ( ?, ?, ?, ?,?)";
        db.run(sql, [player_id, coin, id_station_start, id_station_end, started_at], function (err) {
            if (err) reject(err);
            else resolve( new Game_Result(this.lastID, player_id, coin, id_station_start, id_station_end, started_at));
        });
    });
}

export const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT gr.*, u.username FROM game_result gr JOIN user u ON gr.player_id = u.id WHERE (gr.coin >= 0 and gr.coin IS NOT NULL) GROUP BY gr.player_id HAVING MAX(gr.coin) ORDER BY gr.coin DESC, gr.started_at ASC";
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Game_Result(row.id, row.player_id, row.coin, row.id_station_start, row.id_station_end, row.started_at, row.username)));
            }
        });
    });
}

export const getRoutes = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM route";
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Route(row.id, row.id_station_start, row.id_station_end, row.line)));
            }
        });
    });
}


export const getValidStationPairs = async (minRoutes) => {
    const [stations, routes] = await Promise.all([getStations(), getRoutes()]);
    
    const graph = {};
    for (const s of stations) graph[s.id] = [];
    for (const r of routes) {
        graph[r.id_station_start].push(r.id_station_end);
        graph[r.id_station_end].push(r.id_station_start);
    }
    
    const bfs = (startId) => {
        const dist = { [startId]: 0 };
        const queue = [startId];
        while (queue.length) {
            const curr = queue.shift();
            for (const neighbor of graph[curr]) {
                if (dist[neighbor] === undefined) {
                    dist[neighbor] = dist[curr] + 1;
                    queue.push(neighbor);
                }
            }
        }
        return dist;
    };
    
    const validPairs = [];
    for (const s of stations) {
        const dist = bfs(s.id);
        for (const [targetId, d] of Object.entries(dist)) {
            if (d >= minRoutes && Number(targetId) !== s.id)
                validPairs.push({ start: s.id, end: Number(targetId) });
        }
    }
    
    return validPairs;
};

const getGameFromId = (game_id) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM game_result WHERE id = ?";
        db.get(sql, [game_id], (err, row) => {
            if (err) {
                reject(err);
            } else if (!row) {
                resolve(null); // or reject(new Error("Game.jsx not found"));
            } else {
                resolve(
                    new Game_Result(
                        row.id,
                        row.player_id,
                        row.coin,
                        row.id_station_start,
                        row.id_station_end,
                        row.started_at
                    )
                );
            }
        });
    });
}

export const getValidity = async (game_id, path, player_id) => {
    const [game_result, routes] = await Promise.all([getGameFromId(game_id), getRoutes()]);
    
    if (game_result.player_id !== player_id)
        return { valid: false, reason: "Unauthorized" };
    
    const elapsed = dayjs().diff(dayjs(game_result.started_at, "YYYY-MM-DD HH:mm:ss"), 'second');
    if (elapsed > PLAYTIME + 2) //2 second of buffer for data processing and data transferring
        return { valid: false, reason: "Time expired" };
    
    if (path.rides.length === 0)
        return { valid: false, reason: "The provided path is empty" };
    
    if (path.rides[0].from !== game_result.id_station_start)
        return { valid: false, reason: "Wrong start station" };
    if (path.rides[path.rides.length - 1].to !== game_result.id_station_end)
        return { valid: false, reason: "Wrong end station" };
    
    
    for (let i = 0; i < path.rides.length - 1; i++) {
        if (path.rides[i].to !== path.rides[i + 1].from)
            return { valid: false, reason: `Path is not contiguous at step ${i + 1}` };
    }
    
    for (const ride of path.rides) {
        const exists = routes.some(r => r.id_station_start === ride.from && r.id_station_end === ride.to);
        if (!exists)
            return { valid: false, reason: `ride ${ride.from} → ${ride.to} does not exist` };
    }
    
    return { valid: true };
};

const addGameRides = (game_id, ridesWithEvents) => {
    return new Promise((resolve, reject) => {
        const statementQuery = db.prepare(
            "INSERT INTO game_ride (game_result_id, from_station, to_station, event_id, ride_order) VALUES (?, ?, ?, ?, ?)"
        );
        ridesWithEvents.forEach((r, i) => statementQuery.run([game_id, r.from, r.to, r.event_id, i], (err) => { if (err) reject(err); }));
        statementQuery.finalize((err) => { if (err) reject(err); else resolve(); });
    });
};

export const getGameRides = (game_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT gr.ride_order, gr.from_station, gr.to_station,
                   e.id as event_id, e.title, e.text, e.bonus
            FROM game_ride gr
            JOIN event e ON e.id = gr.event_id
            WHERE gr.game_result_id = ?
            ORDER BY gr.ride_order
        `;
        db.all(sql, [game_id], (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(r => ({
                ride_order: r.ride_order,
                from: r.from_station,
                to: r.to_station,
                event_id: r.event_id,
            })));
        });
    });
};

export const calculateGamePoints = async (game_id, path) => {
    const events = await getRandomEvents(path.rides.length);

    let coin = COIN_BASE;

    const ridesWithEvents = path.rides.map((ride, i) => {
        const ev = events[i % events.length];
        coin += ev.bonus;
        return new Ride_with_event(ride.from, ride.to, ev.id);
    });
    if(coin < 0) coin = 0;
    await updateResultCoin(game_id, coin);
    await addGameRides(game_id, ridesWithEvents);

    return { coin, ridesWithEvents };
}

export const updateResultCoin = async (game_id, coin) => {
    await new Promise((resolve, reject) => {
        const sql = "UPDATE game_result SET coin = ? WHERE id = ?";
        db.run(sql, [coin, game_id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}