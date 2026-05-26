import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function Resumes() {
  const { jobId } = useParams();
  const [resumes, setResumes] = useState([]);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchResumes = () => {
    axios.get(`/resumes/job/${jobId}`).then((r) => setResumes(r.data));
  };

  useEffect(() => { fetchResumes(); }, [jobId]);

  const uploadResume = async () => {
    if (!file) return setMessage("Select a file first.");
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`/resumes/upload/${jobId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMessage("Resume uploaded and scored!");
      setFile(null);
      fetchResumes();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Upload failed.");
    }
    setLoading(false);
  };

  const deleteResume = async (id) => {
    await axios.delete(`/resumes/${id}`);
    fetchResumes();
  };

  const scoreColor = (score) => {
    if (score >= 70) return "#1e8449";
    if (score >= 40) return "#d68910";
    return "#c0392b";
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ color: "#1a5276" }}>📄 Resumes — Job #{jobId}</h2>

      {/* Upload Section */}
      <div style={{ background: "#f4f6f7", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3>Upload Resume</h3>
        <input type="file" accept=".pdf,.txt" onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: "10px", display: "block" }} />
        <button onClick={uploadResume} disabled={loading}
          style={{ background: "#1a5276", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer" }}>
          {loading ? "Processing..." : "Upload & Screen"}
        </button>
        {message && <p style={{ color: message.includes("failed") || message.includes("Duplicate") ? "red" : "green" }}>{message}</p>}
      </div>

      {/* Ranked Resumes */}
      <h3>Ranked Candidates ({resumes.length})</h3>
      {resumes.length === 0 && <p style={{ color: "#999" }}>No resumes uploaded yet.</p>}
      {resumes.map((r, idx) => (
        <div key={r.id} style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ background: "#1a5276", color: "white", borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              #{idx + 1}
            </div>
            <div>
              <strong>{r.candidate_name || "Unknown"}</strong>
              <p style={{ margin: "2px 0", color: "#555", fontSize: "13px" }}>{r.email || "No email"}</p>
              <p style={{ margin: "2px 0", color: "#777", fontSize: "12px" }}>
                Skills: {r.skills ? JSON.parse(r.skills).join(", ") : "N/A"}
              </p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: scoreColor(r.score) }}>
              {r.score.toFixed(1)}%
            </div>
            <div style={{ fontSize: "12px", color: "#999" }}>Match Score</div>
            <button onClick={() => deleteResume(r.id)}
              style={{ marginTop: "8px", background: "#c0392b", color: "white", border: "none", padding: "5px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  background: "white", border: "1px solid #eee", borderRadius: "10px",
  padding: "1rem 1.5rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
};
