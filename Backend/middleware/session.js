const session = require("express-session");

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "changeme",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set to true in prod
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
});

module.exports = sessionMiddleware;