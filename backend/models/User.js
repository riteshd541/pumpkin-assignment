const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  phone: String,
  password: String,
  socketId: String, // Store socket ID to track online users
});

module.exports = mongoose.model("User", UserSchema);
