const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, phone, password: hashedPassword });
  await user.save();
  res.json({ message: "User registered" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1h" });
  res.json({ token, userId: user._id });
});

module.exports = router;
