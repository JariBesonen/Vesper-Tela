exports.session = (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      loggedIn: true,
      username: req.session.username,
      firstName: req.session.firstName,
      lastName: req.session.lastName,
    });
  } else {
    res.json({ loggedIn: false });
  }
};
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid"); // default cookie name for express-session
    res.json({ message: "Logged out" });
  });
};
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
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;
    // Respond with user info (no password)
    res.json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err, err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
};
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");

exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await authModel.findByEmail(email);

    if (existing) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await authModel.createUser({
      firstName,
      lastName,
      email,
      passwordHash: hash,
    });

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.firstName = user.first_name;
    req.session.lastName = user.last_name;

    return res.status(201).json({
      id: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
