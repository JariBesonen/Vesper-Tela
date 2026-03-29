exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }
  try {
    const user = await authModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const bcrypt = require("bcrypt");
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    // Respond with user info (no password)
    res.json({ id: user.id, username: user.username, email: user.email });
  } catch (err) {
    console.error("LOGIN ERROR:", err, err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await authModel.findByEmailOrUsername(email, username);

    if (existing.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await authModel.createUser({
      username,
      email,
      passwordHash: hash,
    });

    return res.status(201).json({ username: user.username, email: user.email });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
