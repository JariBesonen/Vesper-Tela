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
