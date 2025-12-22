import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadURL.css";

export default function UploadURL() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const v = (url || "").trim();
    if (!v.includes("youtube.com") && !v.includes("youtu.be")) {
      setError("⚠️ Please enter a valid YouTube video URL");
      return;
    }
    localStorage.setItem("lecture_url", v);
    navigate("/summary");
  };

  return (
    <div className="url-page">
      <div className="url-card">
        <h2>Upload Lecture URL</h2>
        <p className="small">Paste your YouTube lecture link (may include handwritten notes)</p>

        <form onSubmit={handleSubmit}>
          <textarea
            rows="5"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="📎 Paste your YouTube video URL here..."
            required
          />
          {error && <div className="error-text">{error}</div>}
          <button className="btn" type="submit">Generate Summary</button>
        </form>
      </div>
    </div>
  );
}
