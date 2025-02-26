import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import "./Login.css"; // Import CSS file

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://pumpkin-assignment-wii6.onrender.com/login",
        formData
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      setUser(data.userId);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleSubmit}>
        <div className="logo">
          <img src="/logo.png" alt="Logo" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          name="email"
          required
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Password"
          variant="outlined"
          type="password"
          fullWidth
          name="password"
          required
          onChange={handleChange}
          margin="normal"
        />
        <Button
          style={{ backgroundColor: "#6E80A4" }}
          variant="contained"
          fullWidth
          type="submit"
        >
          Login
        </Button>
        <div style={{ marginTop: "10px" }}>
          Do not have an account? <a href="/">Sign up</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
