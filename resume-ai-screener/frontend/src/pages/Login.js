import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) return setError("Fill all fields.");
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);
      const res = await axios.post("/auth/login", formData);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#eaf2ff" }}>
      <div style={{ background: "white", padding: "2.5rem", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", width: "340px" }}>
        <h2 style={{ color: "#1a5276", textAlign: "center", marginBottom: "1.5rem" }}>🤖 ResumeAI Screener</h2>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={inputStyle} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}
        <button onClick={handleLogin} style={btnStyle}>Login</button>
      </div>
    </div>
  );
}

const inputStyle = { display: "block", width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px", boxSizing: "border-box" };
const btnStyle = { width: "100%", background: "#1a5276", color: "white", border: "none", padding: "12px", borderRadius: "6px", cursor: "pointer", fontSize: "15px", marginTop: "10px" };
