import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function getUsers() {
    try {
      const raw = localStorage.getItem("lg_users");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function authenticate(emailVal, passwordVal) {
    const users = getUsers();
    return users.find((u) => u.email === emailVal && u.password === passwordVal);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const eclean = (email || "").trim().toLowerCase();
    const user = authenticate(eclean, password);
    if (user) {
      // set demo token + current user
      try {
        localStorage.setItem("lg_token", "demo-token-" + Date.now());
        localStorage.setItem("lg_current_user", JSON.stringify({ name: user.name, email: user.email }));
      } catch {}
      // redirect to Upload URL page after successful login
      navigate("/upload-url");
    } else {
      setError("Invalid credentials. Please check email/password or create an account.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Welcome back</h2>
        <p className="small">Login to your LecturaGenie account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}

          <button className="btn" type="submit">Login</button>
        </form>

        <p className="small" style={{ marginTop: 12, textAlign: "center" }}>
          Don’t have an account?{" "}
          <Link to="/create-account" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Create One
          </Link>
        </p>
      </div>
    </div>
  );
}
