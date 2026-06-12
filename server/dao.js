
import sqlite from "sqlite3";
import crypto from "crypto";
import {Station, User, Event, Route, Game_Result} from "./models.js";

const db = new sqlite.Database("UltimaCorsa.sqlite", (err) => {
    if (err) throw err;
});


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

            const sql = "INSERT INTO user (username, password, firstaname, lastname, birth_date, email, salt) VALUES (?, ?, ?, ?, ?, ?, ?)";
            db.run(sql, [username, hashedPassword.toString("hex"), firstname, lastname, birth_date, email, salt], function (err) {
                if (err) reject(err);
                else resolve( new User(this.id, username, password, firstname, lastname, birth_date, email, salt));
            });
        });
    });
};


/* STATIONS */
export const getStations = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM station";
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

export const getEvents = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM event ";
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Event(row.id, row.title, row.text, row.bonus)));
            }
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
                resolve(rows.map(row => new Game_Result(row.id, row.date, row.player_id, row.coin, row.id_station_start, row.id_station_end)));
            }
        });
    });
}

export const addResult = (date, player_id, coin, id_station_start, id_station_end) => {
    return new Promise((resolve, reject) => {
        const sql = "INSERT INTO game_result (date, player_id, coin, id_station_start, id_station_end) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [date, player_id, coin, id_station_start, id_station_end], function (err) {
            if (err) reject(err);
            else resolve( new Game_Result(this.id, date, player_id, coin, id_station_start, id_station_end));
        });
    });
}

export const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM game_result GROUP BY player_id HAVING MAX(coin) ORDER BY coin DESC";
        db.all(sql, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows.map(row => new Game_Result(row.id, row.date, row.player_id, row.coin, row.id_station_start, row.id_station_end)));
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