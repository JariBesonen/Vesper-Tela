const pool = require("../config/db");

const makeUsernameBase = (firstName, lastName, email) => {
  const normalizedFirst = String(firstName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
  const normalizedLast = String(lastName || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");
  const emailPrefix = String(email || "")
    .split("@")[0]
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, "");

  const base = `${normalizedFirst}${normalizedLast}` || emailPrefix || "shopper";
  return base.slice(0, 40);
};

const generateUsername = async (firstName, lastName, email) => {
  const base = makeUsernameBase(firstName, lastName, email);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    const candidate = `${base}-${suffix}`.slice(0, 100);

    const res = await pool.query("SELECT 1 FROM users WHERE username = $1", [
      candidate,
    ]);
    if (res.rowCount === 0) {
      return candidate;
    }
  }

  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`.slice(0, 100);
};

const findByEmail = async (email) => {
  const res = await pool.query(
    "SELECT id, username, first_name, last_name, email, password_hash FROM users WHERE email = $1",
    [email]
  );
  return res.rows[0];
};

const createUser = async ({ firstName, lastName, email, passwordHash }) => {
  const username = await generateUsername(firstName, lastName, email);
  const res = await pool.query(
    "INSERT INTO users (username, first_name, last_name, email, password_hash, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, username, first_name, last_name, email",
    [username, firstName, lastName, email, passwordHash]
  );
  return res.rows[0];
};

const findById = async (id) => {
  const res = await pool.query(
    "SELECT id, username, first_name, last_name, email FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0];
};

module.exports = {
  createUser,
  findById,
  findByEmail,
};
