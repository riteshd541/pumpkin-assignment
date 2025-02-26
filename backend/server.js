require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Import Models
const User = require("./models/User");
const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000", // Frontend URL
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

/**
 * ===============================
 * User Authentication Routes
 * ===============================
 */

// User Signup
app.post("/signup", async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, phone, password: hashedPassword });
    await newUser.save();
    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id, email: user.email });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users", async (req, res) => {
  const { userId } = req.query; // Logged-in user's ID
  if (!userId) return res.status(400).json({ error: "User ID not provided" });

  try {
    const users = await User.find({ _id: { $ne: userId } }).select(
      "email phone isOnline"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

/**
 * ===============================
 * Socket.io for Real-Time Chat
 * ===============================
 */

io.on("connection", async (socket) => {
  console.log("New client connected:", socket.id);

  // Handle user coming online
  socket.on("userOnline", async ({ email }) => {
    const user = await User.findOneAndUpdate(
      { email },
      { socketId: socket.id, isOnline: true },
      { new: true }
    );

    if (user) {
      // Notify others that user is online
      io.emit("updateUserStatus", { email, status: "online" });

      // Send undelivered messages
      const undeliveredMessages = await Message.find({
        receiver: email,
        delivered: false,
      });
      undeliveredMessages.forEach((msg) => {
        io.to(socket.id).emit("receiveMessage", msg);
        msg.delivered = true;
        msg.save();
      });
    }
  });

  // Handle sending messages
  socket.on("sendMessage", async ({ sender, receiver, message }) => {
    const recipient = await User.findOne({ email: receiver });

    if (recipient && recipient.socketId) {
      io.to(recipient.socketId).emit("receiveMessage", { sender, message });
    } else {
      // Store the message for later delivery
      await new Message({ sender, receiver, message }).save();
    }
  });

  // Handle user disconnecting
  socket.on("disconnect", async () => {
    const user = await User.findOneAndUpdate(
      { socketId: socket.id },
      { isOnline: false, socketId: null },
      { new: true }
    );

    if (user) {
      io.emit("updateUserStatus", { email: user.email, status: "offline" });
    }

    console.log("User disconnected:", socket.id);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
