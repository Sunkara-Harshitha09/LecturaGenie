import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/*
 Summary page:
 - Reads `lecture_url` from localStorage
 - Shows YouTube embed
 - Tries to call POST /api/summarize { url }
 - If server returns summary -> show it
 - If server not available -> allow user to paste transcript and run client-side summarizer
*/

const STOPWORDS = new Set([
  "a","about","above","after","again","against","all","am","an","and","any","are","as","at",
  "be","because","been","before","being","below","between","both","but","by",
  "could","did","do","does","doing","down","during",
  "each","few","for","from","further",
  "had","has","have","having","he","her","here","hers","herself","him","himself","his","how",
  "i","if","in","into","is","it","its","itself",
  "let's","me","more","most","my","myself",
  "nor","of","on","once","only","or","other","ought","our","ours","ourselves","out","over","own",
  "same","she","should","so","some","such","than","that","the","their","theirs","them","themselves","then","there","these","they","this","those","through","to","too",
  "under","until","up","very","was","we","were","what","when","where","which","while","who","whom","why","with","would","you","your","yours","yourself","yourselves"
]);

function extractVideoId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.has("v")) return u.searchParams.get("v");
    // sometimes the id is in path after /v/
    const match = url.match(/\/embed\/([a-zA-Z0-9_-]{11})|\/v\/([a-zA-Z0-9_-]{11})/);
    return match ? (match[1] || match[2]) : null;
  } catch {
    return null;
  }
}

// Simple extractive summarizer: score sentences by word-frequency (ignoring stopwords)
function summarizeText(text, sentenceCount = 5) {
  if (!text) return "";

  // split into sentences (simple)
  const sentences = text
    .replace(/\n+/g, ". ")
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (sentences.length === 0) return "";

  // build word frequencies
  const freq = {};
  for (const wordRaw of text.split(/\s+/)) {
    const w = wordRaw.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!w || STOPWORDS.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }

  // score sentences
  const scored = sentences.map(s => {
    const words = s.split(/\s+/);
    let score = 0;
    for (const wr of words) {
      const w = wr.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (freq[w]) score += freq[w];
    }
    // normalize by sentence length
    score = score / Math.max(1, words.length);
    return { s, score };
  });

  // pick top sentences
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, Math.min(sentenceCount, scored.length));
  // preserve original order
  top.sort((a, b) => sentences.indexOf(a.s) - sentences.indexOf(b.s));
  return top.map(t => t.s).join(" ");
}

export default function Summary() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverSummary, setServerSummary] = useState("");
  const [serverError, setServerError] = useState("");
  const [transcript, setTranscript] = useState("");
  const [clientSummary, setClientSummary] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("lecture_url") || "";
    setUrl(saved);
    const id = extractVideoId(saved || "");
    setVideoId(id);
    // try server summarization
    if (saved) fetchServerSummary(saved);
  }, []);

  async function fetchServerSummary(videoUrl) {
    setLoading(true);
    setServerError("");
    setServerSummary("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });
      if (!res.ok) {
        const err = await res.text();
        setServerError("Server error: " + (err || res.statusText));
      } else {
        const data = await res.json();
        if (data.summary) setServerSummary(data.summary);
        else setServerError("Server returned no summary.");
      }
    } catch (err) {
      setServerError("Could not contact server. You can paste transcript below to summarize locally.");
    } finally {
      setLoading(false);
    }
  }

  function handleLocalSummarize() {
    const s = summarizeText(transcript, 6);
    setClientSummary(s || "Could not generate a summary from provided transcript.");
  }

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", padding: 16 }}>
      <div style={{ background: "#fff", padding: 22, borderRadius: 12, boxShadow: "0 8px 30px rgba(2,6,23,0.06)" }}>
        <h2 style={{ color: "#0a66c2", marginBottom: 6 }}>Lecture Summary</h2>
        <p style={{ color: "#6b7280", marginBottom: 18 }}>Source URL:</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 420px", minWidth: 320 }}>
            <div style={{ marginBottom: 12, color: "#111" }}>{url || "(no url saved)"}</div>

            {videoId ? (
              <div style={{ aspectRatio: "16/9", width: "100%", marginBottom: 12 }}>
                <iframe
                  title="lecture-player"
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ borderRadius: 8 }}
                />
              </div>
            ) : (
              <div style={{ marginBottom: 12, color: "#6b7280" }}>Video player not available (invalid URL)</div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" onClick={() => { if (url) fetchServerSummary(url); }}>
                {loading ? "Generating..." : "Try Server Summary"}
              </button>
              <button className="btn" onClick={() => { localStorage.removeItem("lecture_url"); navigate("/upload-url"); }} style={{ background: "#ef4444" }}>
                Change URL
              </button>
            </div>
          </div>

          <div style={{ flex: "1 1 480px", minWidth: 320 }}>
            <div style={{ marginBottom: 10 }}>
              <strong style={{ color: "#374151" }}>Server summary</strong>
              {loading && <div style={{ color: "#6b7280" }}>Generating on server...</div>}
              {serverError && <div style={{ color: "crimson", marginTop: 8 }}>{serverError}</div>}
              {serverSummary && <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{serverSummary}</div>}
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #eef2f7", margin: "12px 0" }} />

            <div>
              <strong style={{ color: "#374151" }}>No-server fallback — paste transcript</strong>
              <p style={{ color: "#6b7280", marginTop: 6 }}>If the server is not available (or the video has handwritten notes), paste the transcript below and click <em>Summarize Transcript</em>.</p>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                rows={8}
                placeholder="Paste video transcript or typed notes here..."
                style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e6edf3", resize: "vertical" }}
              />

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <button className="btn" onClick={handleLocalSummarize}>Summarize Transcript</button>
                <button className="btn" onClick={() => { setTranscript(""); setClientSummary(""); }} style={{ background: "#ef4444" }}>Clear</button>
              </div>

              {clientSummary && (
                <div style={{ marginTop: 12 }}>
                  <strong style={{ color: "#111" }}>Client summary</strong>
                  <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{clientSummary}</div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
