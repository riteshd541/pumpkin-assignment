import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TextField, Button } from "@mui/material";
import "./Signup.css"; // Import CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/signup", formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSubmit}>
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
          label="Phone Number"
          variant="outlined"
          fullWidth
          name="phone"
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
          Sign Up
        </Button>
        <div style={{ marginTop: "10px" }}>
          Already have an account? <a href="/login">Login</a>
        </div>
      </form>
    </div>
  );
};

export default Signup;
