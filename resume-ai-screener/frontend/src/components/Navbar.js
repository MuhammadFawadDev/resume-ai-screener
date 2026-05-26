import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (!isLoggedIn) return null;

  return (
    <nav style={{
      background: "#1a5276", padding: "0.8rem 2rem",
      display: "flex", justifyContent: "space-between", alignItems: "center"
    }}>
      <div style={{ display: "flex", gap: "1.5rem" }}>
        <Link to="/dashboard" style={linkStyle}>📊 Dashboard</Link>
        <Link to="/jobs" style={linkStyle}>💼 Jobs</Link>
      </div>
      <button onClick={logout} style={{
        background: "transparent", color: "white", border: "1px solid white",
        padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px"
      }}>Logout</button>
    </nav>
  );
}

const linkStyle = { color: "white", textDecoration: "none", fontSize: "15px", fontWeight: "500" };
