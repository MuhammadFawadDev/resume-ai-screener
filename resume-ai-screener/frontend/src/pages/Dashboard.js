import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ totalJobs: 0, totalResumes: 0 });

  useEffect(() => {
    axios.get("/jobs/").then((res) => {
      setJobs(res.data);
      setStats((s) => ({ ...s, totalJobs: res.data.length }));
    });
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
      <h2 style={{ color: "#1a5276" }}>📊 Dashboard</h2>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem" }}>
        <StatCard label="Total Jobs" value={stats.totalJobs} color="#1a5276" />
        <StatCard label="Active Positions" value={jobs.length} color="#117a65" />
      </div>

      {/* Bar Chart */}
      <h3>Jobs Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={jobs.map((j) => ({ name: j.title, id: j.id }))}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="id" fill="#1a5276" name="Job ID" />
        </BarChart>
      </ResponsiveContainer>

      {/* Jobs Table */}
      <h3 style={{ marginTop: "2rem" }}>Recent Jobs</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1a5276", color: "white" }}>
            <th style={th}>ID</th>
            <th style={th}>Title</th>
            <th style={th}>Created At</th>
            <th style={th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={td}>{job.id}</td>
              <td style={td}>{job.title}</td>
              <td style={td}>{new Date(job.created_at).toLocaleDateString()}</td>
              <td style={td}>
                <a href={`/resumes/${job.id}`} style={{ color: "#1a5276" }}>View Resumes</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: color, color: "white", padding: "1.5rem 2rem",
      borderRadius: "10px", minWidth: "150px", textAlign: "center"
    }}>
      <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{value}</div>
      <div style={{ fontSize: "0.9rem", marginTop: "4px" }}>{label}</div>
    </div>
  );
}

const th = { padding: "10px 14px", textAlign: "left" };
const td = { padding: "10px 14px" };
