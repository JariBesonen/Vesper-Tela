const pool = require("../config/db");

const findByEmailOrUsername = async (email, username) => {
  const res = await pool.query(
    "SELECT id, username, email FROM users WHERE email = $1 OR username = $2",
    [email, username]
  );
  return res.rows;
};

const createUser = async ({ username, email, passwordHash }) => {
  const res = await pool.query(
    "INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, username, email",
    [username, email, passwordHash]
  );
  return res.rows[0];
};

const findById = async (id) => {
  const res = await pool.query(
    "SELECT id, username, email FROM users WHERE id = $1",
    [id]
  );
  return res.rows[0];
};

module.exports = {
  findByEmailOrUsername,
  createUser,
  findById,
};
