import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const fetchJobs = () => axios.get("/jobs/").then((r) => setJobs(r.data));
  useEffect(() => { fetchJobs(); }, []);

  const createJob = async () => {
    if (!title || !description) return setMessage("Fill all fields.");
    await axios.post("/jobs/", { title, description });
    setTitle(""); setDescription("");
    setMessage("Job created!");
    fetchJobs();
  };

  const deleteJob = async (id) => {
    await axios.delete(`/jobs/${id}`);
    fetchJobs();
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ color: "#1a5276" }}>💼 Job Postings</h2>

      {/* Create Job Form */}
      <div style={{ background: "#f4f6f7", padding: "1.5rem", borderRadius: "10px", marginBottom: "2rem" }}>
        <h3>Create New Job</h3>
        <input placeholder="Job Title" value={title} onChange={(e) => setTitle(e.target.value)}
          style={inputStyle} />
        <textarea placeholder="Job Description" value={description} onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, height: "100px" }} />
        <button onClick={createJob} style={btnStyle}>+ Create Job</button>
        {message && <p style={{ color: "green" }}>{message}</p>}
      </div>

      {/* Jobs List */}
      {jobs.map((job) => (
        <div key={job.id} style={cardStyle}>
          <div>
            <strong style={{ fontSize: "1.1rem" }}>{job.title}</strong>
            <p style={{ color: "#555", margin: "4px 0" }}>{job.description.slice(0, 120)}...</p>
            <small style={{ color: "#999" }}>{new Date(job.created_at).toLocaleDateString()}</small>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <a href={`/resumes/${job.id}`} style={{ color: "#1a5276", fontWeight: "bold" }}>View Resumes</a>
            <button onClick={() => deleteJob(job.id)} style={{ ...btnStyle, background: "#c0392b" }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const inputStyle = { display: "block", width: "100%", padding: "10px", margin: "8px 0", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" };
const btnStyle = { background: "#1a5276", color: "white", border: "none", padding: "10px 20px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" };
const cardStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", border: "1px solid #eee", borderRadius: "10px", padding: "1rem 1.5rem", marginBottom: "1rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" };
