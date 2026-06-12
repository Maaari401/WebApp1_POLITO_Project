
import dayjs from "dayjs";

function Station(id, name) {
    this.id = id;
    this.name = name;
}

function Route(id, start_station_id, end_station_id){
    this.id = id;
    this.start_station_id = start_station_id;
    this.end_station_id = end_station_id;
}

function User(id, username, email, firstname, lastname, date) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.firstname = firstname;
    this.lastname = lastname;
    this.date = dayjs(date);
}
function Event(id, text, bonus){
    this.id = id;
    this.title = title;
    this.text = text;
    this.bonus = bonus;
}

function Game_Result(id, date, player_id, coin){
    this.id = id;
    this.date = date;
    this.player_id = player_id;
    this.coin = coin;
}


export {Station, User, Route, Event, Game_Result};