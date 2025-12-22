import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setError("");
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanName = (name || "").trim();
    if (!cleanName || !cleanEmail || !password) {
      setError("Please fill all fields");
      return;
    }

    // safe localStorage handling
    let users = [];
    try { users = JSON.parse(localStorage.getItem("lg_users") || "[]"); } catch { users = []; }
    if (users.some(u => u.email === cleanEmail)) {
      setError("Account already exists. Please login.");
      return;
    }

    users.push({ name: cleanName, email: cleanEmail, password });
    try { localStorage.setItem("lg_users", JSON.stringify(users)); } catch {}

    // after signup, go to login (so user explicitly logs in)
    navigate("/login");
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Create Account</h2>
        <p className="small">Join LecturaGenie for smarter learning</p>

        <form onSubmit={handleSignup}>
          <label>Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />

          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

          {error && <div style={{ color: "crimson", marginTop: 8 }}>{error}</div>}

          <button className="btn" type="submit">Sign Up</button>
        </form>
      </div>
    </div>
  );
}
