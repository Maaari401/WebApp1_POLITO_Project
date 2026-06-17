import { User, Station, Route, Event, Game_Result, Ride_with_event } from "../models/models.js";

const SERVER = "http://localhost:3001";

const handleError = async (res) => {
    const data = await res.json();
    throw new Error(data.errors?.[0]?.msg || data.error || "Request failed");
};

const login = async (username, password) => {
    const res = await fetch(`${SERVER}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok) await handleError(res);
    const u = await res.json();
    return new User(u.id, u.username, u.email, u.firstname, u.lastname, u.date);
};

const logout = async () => {
    const res = await fetch(`${SERVER}/api/sessions/current`, {
        method: "DELETE",
        credentials: "include",
    });
    if (!res.ok) await handleError(res);
};

const getCurrentUser = async () => {
    const res = await fetch(`${SERVER}/api/sessions/current`, {
        credentials: "include",
    });
    if (!res.ok) return null;
    const u = await res.json();
    return new User(u.id, u.username, u.email, u.firstname, u.lastname, u.date);
};

const register = async (userData) => {
    const res = await fetch(`${SERVER}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(userData),
    });
    if (!res.ok) await handleError(res);
    const u = await res.json();
    return new User(u.id, u.username, u.email, u.firstname, u.lastname, u.date);
};

const getStations = async () => {
    const res = await fetch(`${SERVER}/api/stations`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const data = await res.json();
    return data.map((s) => new Station(s.id, s.name));
};

const getStation = async (id) => {
    const res = await fetch(`${SERVER}/api/station/${id}`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const s = await res.json();
    return new Station(s.id, s.name);
};

const getRoutes = async () => {
    const res = await fetch(`${SERVER}/api/routes`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const data = await res.json();
    return data.map((r) => new Route(r.id, r.id_station_start, r.id_station_end));
};

const getEvent = async (id) => {
    const res = await fetch(`${SERVER}/api/event/${id}`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const e = await res.json();
    return new Event(e.id, e.title, e.text, e.bonus);
};

const getLeaderboard = async () => {
    const res = await fetch(`${SERVER}/api/leaderBoard`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    return res.json();
};

const getPlayerResults = async (player_id) => {
    const res = await fetch(`${SERVER}/api/game_result_player/${player_id}`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const data = await res.json();
    return data.map((g) => new Game_Result(g.id, g.player_id, g.coin, g.id_station_start, g.id_station_end, g.started_at));
};

const getGameRides = async (gameId) => {
    const res = await fetch(`${SERVER}/api/game/${gameId}/rides`, { credentials: "include" });
    if (!res.ok) await handleError(res);
    const data = await res.json();
    return data.map((r) => new Ride_with_event(r.from, r.to, r.event_id));
};

const startGame = async () => {
    const res = await fetch(`${SERVER}/api/game/start`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) await handleError(res);
    return res.json(); // { game_id, start, end }
};

const submitGame = async (game_id, path) => {
    const res = await fetch(`${SERVER}/api/game/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ game_id, path }),
    });
    if (!res.ok) await handleError(res);
    return await res.json();
};

const API = {
    login, logout, getCurrentUser, register,
    getStations, getStation, getRoutes, getEvent,
    getLeaderboard, getPlayerResults, getGameRides,
    startGame, submitGame,
};

export default API;