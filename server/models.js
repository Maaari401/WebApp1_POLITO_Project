
import dayjs from "dayjs";

function Station(id, name) {
    this.id = id;
    this.name = name;
}

function Route(id, id_station_start, id_station_end){
    this.id = id;
    this.id_station_start = id_station_start;
    this.id_station_end = id_station_end;
}

function User(id, username, email, firstname, lastname, date) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.date = dayjs(date);
}
function Event(id, title, text, bonus){
    this.id = id;
    this.title = title;
    this.text = text;
    this.bonus = bonus;
}

function Game_Result(id, player_id, coin, id_station_start, id_station_end, started_at, username){
    this.id = id;
    this.player_id = player_id;
    this.coin = coin;
    this.id_station_start = id_station_start;
    this.id_station_end = id_station_end;
    this.started_at = started_at;
    this.username = username;
}


function Ride(from, to) {
    this.from = from;
    this.to = to;
}
function Ride_with_event(from, to, event_id){
    this.from = from;
    this.to = to;
    this.event_id = event_id;
}


function Path(game_id, legs) {
    this.game_id = game_id;
    this.legs = legs; // Leg[]
}



export {Station, User, Route, Event, Game_Result, Ride, Path, Ride_with_event};