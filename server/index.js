
import express from "express";
import morgan from "morgan";
import { check, validationResult } from "express-validator";

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import dayjs from "dayjs";
import cors from "cors";

import {
    addResult,
    createUser,
    getEventById,
    getEvents,
    getLeaderboard,
    getPlayerResults, getRoutes,
    getStationById,
    getStations,
    getUser
} from "./dao.js";

// init
const app = express();
const port = 3001;

// middlewares
app.use(express.json());
app.use(morgan("dev"));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
  const user = await getUser(username, password);
  if(!user)
    return cb(null, false, "Incorrect username or password."); // error message in the WWW-Authenticate header of the response

  return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({error: "Not authorized"});
}

app.use(session({
  secret: "shhhhh... it's a secret!",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate("session"));

const corsOptions = {
  origin: "http://localhost:5173",
  optionsSuccessState: 200,
  exposedHeaders: ["WWW-Authenticate"],
  credentials: true
};

app.use(cors(corsOptions));

/* ROUTES */


// POST /api/sessions
app.post("/api/sessions", passport.authenticate("local"), function(req, res) {
  return res.status(201).json(req.user);
});

// GET /api/sessions/current
app.get("/api/sessions/current", (req, res) => {
  if(req.isAuthenticated()) {
    res.json(req.user);}
  else
    res.status(401).json({error: "Not authenticated"});
});

// DELETE /api/sessions/current
app.delete("/api/sessions/current", isLoggedIn,(req, res) => {
  req.logout(() => {
    res.end();
  });
});

// POST /api/users (register)
app.post("/api/users", [
    check("username").notEmpty().withMessage("Username is required"),
    check("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    check("firstname").notEmpty().withMessage("First name is required"),
    check("lastname").notEmpty().withMessage("Last name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("birth_date").isDate().withMessage("Valid birth date is required"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const user = await createUser(
            req.body.username,
            req.body.password,
            req.body.firstname,
            req.body.lastname,
            req.body.birth_date,
            req.body.email
        );
        return res.status(201).json(user);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});

//GET /api/station/<id>
app.get("/api/station/:id", isLoggedIn, [check("id").isInt().withMessage("The id must be an int")], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const station = await getStationById(req.params.id)
        return res.status(200).json(station);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});

//GET /api/stations
app.get("/api/stations", isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const stations = await getStations()
        return res.status(200).json(stations);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});




//GET /api/event/<id>
app.get("/api/event/:id", isLoggedIn, [check("id").isInt().withMessage("The id must be an int")], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const event = await getEventById(req.params.id)
        return res.status(200).json(event);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});
/*
//GET /api/random_event
app.get("/api/random_event", isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const events = await getRandomEvent()
        return res.status(200).json(events[Math.floor(Math.random() * events.length)]);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});
*/













//GET /api/game_result_player
app.get("/api/game_result_player", isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    
    if (parseInt(req.params.id) !== req.user.id)
        return res.status(403).json({ error: "can't ask for game results of another player" });
    
    try {
        const Results = await getPlayerResults(req.params.id)
        return res.status(200).json(Results);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});

//GET /api/leaderBoard
app.get("/api/leaderBoard", isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const board = await getLeaderboard()
        return res.status(200).json(board);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});
/*
// POST /api/game_result
app.post("/api/game_result", isLoggedIn, [
    check("coin").isNumeric().withMessage("Coin must be a number"),
    check("id_station_start").isNumeric().withMessage("Start station is required"),
    check("id_station_end").isNumeric().withMessage("End station is required"),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    
    try {
        const stationStart = await getStationById(req.body.id_station_start);
        if (!stationStart)
            return res.status(404).json({ error: "Start station not found" });
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
    
    try {
        const stationEnd = await getStationById(req.body.id_station_end);
        if (!stationEnd)
            return res.status(404).json({ error: "End station not found" });
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
    
    try {
        const result = await addResult(
            dayjs().format("YYYY-MM-DD HH:mm:ss"),
            req.user.id, //player id is taken from the user session due to security issue by allowing fake user values.
            req.body.coin,
            req.body.id_station_start,
            req.body.id_station_end
        );
        return res.status(201).json(result);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});
*/

//GET /api/routes
app.get("/api/routes", isLoggedIn, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(422).json({ errors: errors.array() });
    try {
        const routes = await getRoutes()
        return res.status(200).json(routes);
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});


// activate the server
app.listen(port, () => {
  console.log(`API Server listening at http://localhost:${port}`);
});


