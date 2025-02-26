import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/chat" element={<Chat user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
