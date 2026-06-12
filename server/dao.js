
import sqlite from "sqlite3";
import crypto from "crypto";
import {User} from "./models.js";

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