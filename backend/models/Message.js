const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  delivered: { type: Boolean, default: false },
});

module.exports = mongoose.model("Message", MessageSchema);
