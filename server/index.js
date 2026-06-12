
import express from "express";
import morgan from "morgan";
import { check, validationResult } from "express-validator";

import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

import cors from "cors";

import {createUser, getUser} from "./dao.js";

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

// DELETE /api/session/current
app.delete("/api/sessions/current", (req, res) => {
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


// activate the server
app.listen(port, () => {
  console.log(`API Server listening at http://localhost:${port}`);
});


