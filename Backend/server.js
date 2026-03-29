// Backend/server.js

require("dotenv").config();
const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");



app.disable("x-powered-by");

// -----------------------------
// 1. JSON + URL parsing FIRST
// -----------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// 2. CORS (must come BEFORE Helmet)
// -----------------------------
const allowedOrigins = [
  "http://localhost:5173"
//   "https://thepalewitch.com",
//   "https://www.thepalewitch.com",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) || origin.endsWith(".vercel.app");

    if (isAllowed) return callback(null, true);

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// NOTE: DO NOT add `app.options("*", ...)` here.
// Your cors middleware above already handles preflight.

// -----------------------------
// 3. Helmet (must come AFTER CORS)
// -----------------------------
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  })
);

// -----------------------------
// 4. Database + Routes
// -----------------------------
const pool = require("./db");

// Test DB route
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json(result.rows);
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ error: "db test failed" });
  }
});

// ROUTES


// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// -----------------------------
// 5. Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
