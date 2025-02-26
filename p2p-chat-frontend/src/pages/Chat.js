import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { TextField, Button, Typography, Avatar } from "@mui/material";
import "./Chat.css";

import axios from "axios";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnection: true, // Ensures the client reconnects if the connection drops
  reconnectionAttempts: 10, // Limits reconnection attempts
  reconnectionDelay: 1000, // Wait 1s before retrying connection
});

const Chat = ({ user }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [receiver, setReceiver] = useState("");
  const [onlineUsers, setOnlineUsers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch all users except logged-in user
    axios
      .get(
        `http://localhost:5000/users?userId=${localStorage.getItem("userId")}`
      )
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));

    // Load messages from localStorage
    const storedMessages = JSON.parse(localStorage.getItem("messages")) || [];
    setMessages(storedMessages);

    // Emit that user is online
    socket.emit("userOnline", { email: user });

    // Listen for online users update
    socket.on("updateUserStatus", ({ email, status }) => {
      setOnlineUsers((prev) => ({
        ...prev,
        [email]: status === "online",
      }));
    });

    // Listen for real-time incoming messages
    socket.on("receiveMessage", (msg) => {
      console.log("New message received:", msg);
      setMessages((prev) => {
        const updatedMessages = [...prev, msg];
        localStorage.setItem("messages", JSON.stringify(updatedMessages));
        return updatedMessages;
      });
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("updateOnlineUsers");
    };
  }, [user, navigate]);

  const sendMessage = () => {
    if (!message.trim() || !receiver) return;

    const msgData = {
      sender: user,
      receiver,
      message,
      timestamp: new Date().toISOString(),
    };

    // Emit message to socket server
    socket.emit("sendMessage", msgData);

    // Save to local state and localStorage
    setMessages((prev) => {
      const updatedMessages = [...prev, msgData];
      localStorage.setItem("messages", JSON.stringify(updatedMessages));
      return updatedMessages;
    });

    setMessage("");
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Chat Logo" className="chat-logo" />
        </div>
        <div className="search-bar">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search"
            size="small"
          />
        </div>
        <div className="contacts">
          {users.map((u) => (
            <div
              key={u.email}
              className="contact"
              onClick={() => setReceiver(u.email)}
            >
              <Avatar className="avatar">{u.email[0].toUpperCase()}</Avatar>
              <div>
                <Typography variant="subtitle2">{u.email}</Typography>
                <Typography variant="caption">{u.phone}</Typography>
              </div>
              {onlineUsers[u.email] ? (
                <span className="online-badge"></span>
              ) : (
                <Typography variant="caption">Offline</Typography>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Section */}
      <main className="chat-main">
        <header className="chat-header">
          <Avatar className="avatar">
            {receiver ? receiver[0].toUpperCase() : "?"}
          </Avatar>
          <Typography variant="h6">
            {receiver || "Select a user to chat"}
          </Typography>
        </header>
        <div className="messages">
          {messages
            .filter((msg) => msg.sender === user || msg.receiver === user)
            .map((msg, index) => (
              <div
                key={index}
                className={`message ${
                  msg.sender === user ? "sent" : "received"
                }`}
              >
                <Typography variant="body2">{msg.message}</Typography>
                <Typography variant="caption" className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </div>
            ))}
        </div>
        <footer className="chat-footer">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message"
            size="small"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={sendMessage}
            disabled={!receiver}
          >
            Send
          </Button>
        </footer>
      </main>
    </div>
  );
};

export default Chat;
