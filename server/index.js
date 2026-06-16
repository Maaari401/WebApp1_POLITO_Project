
import express from "express";
import morgan from "morgan";
import { check, validationResult } from "express-validator";

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';
import dayjs from "dayjs";
import cors from "cors";

import {
    addResult, calculateGamePoints,
    createUser,
    getEventById,
    getLeaderboard,
    getPlayerResults, getRoutes,
    getStationById,
    getStations,
    getUser,
    getValidity,
    getValidStationPairs
} from "./dao.js";

// init
const app = express();
const port = 3001;
const MIN_ROUTES = 3

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


//POST /api/game/start
app.post("/api/game/start", isLoggedIn, async (req, res) => {
    try {
        const validPairs = await getValidStationPairs(MIN_ROUTES);
        
        if (validPairs.length === 0)
            return res.status(500).json({ error: "No valid start/end pairs found in the network" });
        
        const pair = validPairs[Math.floor(Math.random() * validPairs.length)];
        const saved = await addResult(req.user.id, null, pair.start, pair.end, dayjs().format("YYYY-MM-DD HH:mm:ss"))
        
        return res.status(201).json({
            game_id: saved.id,
            start: pair.start,
            end:   pair.end,
        });
        
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});
//POST /api/game/submit
app.post("/api/game/submit", isLoggedIn, async (req, res) => {
    try {
        const validity = await getValidity(req.body.game_id, req.body.path, req.user.id);
        if (!validity.valid)
            return res.status(500).json({ error: validity.reason });
        const { coin, ridesWithEvents } = await calculateGamePoints(req.body.game_id, req.body.path);

        res.status(200).json({
            valid: validity.valid,
            coin,
            path: ridesWithEvents
        })
    } catch (err) {
        return res.status(503).json({ error: err.message });
    }
});


// activate the server
app.listen(port, () => {
  console.log(`API Server listening at http://localhost:${port}`);
});
