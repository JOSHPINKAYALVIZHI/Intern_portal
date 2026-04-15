// import React from "react";
// import ApprovalPanel from "../components/admin/ApprovalPanel";
// import InternTable from "../components/admin/InternTable";

// export default function AdminDashboard() {
//   return (
//     <div className="min-h-screen bg-gray-50 p-10">

//       <h1 className="text-3xl font-bold text-purple-700 mb-8">
//         Admin Dashboard
//       </h1>

//       <div className="mb-10">
//         <ApprovalPanel />
//       </div>

//       <div>
//         <InternTable />
//       </div>

//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function AdminDashboard() {
  const [interns, setInterns] = useState([]);
  const [expandedIntern, setExpandedIntern] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await API.get("/admin/all-interns-detailed");
      setInterns(response.data);
      
      const leaderRes = await API.get("/admin/leaderboard");
      setLeaderboard(leaderRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.post(`/admin/approve/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/admin/reject/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Intern Submissions */}
      <div style={styles.card}>
        <h2>📋 All Intern Submissions</h2>
        
        {interns.length === 0 ? (
          <p style={{ color: "gray" }}>No interns found</p>
        ) : (
          interns.map((intern) => (
            <div key={intern.user_id} style={styles.internCard}>
              <div 
                style={styles.internHeader}
                onClick={() => setExpandedIntern(expandedIntern === intern.user_id ? null : intern.user_id)}
              >
                <div>
                  <strong>{intern.name}</strong> ({intern.reg_no})
                  <br />
                  <span style={{ fontSize: "0.9em", color: "#666" }}>Domain: {intern.domain}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={styles.pointsBadge}>{intern.total_points} pts</span>
                  <span style={{ marginLeft: "10px", cursor: "pointer" }}>
                    {expandedIntern === intern.user_id ? "▼" : "▶"}
                  </span>
                </div>
              </div>

              {expandedIntern === intern.user_id && (
                <div style={styles.internDetails}>
                  <p><strong>Email:</strong> {intern.college_email}</p>
                  
                  <h4>📝 Daily Submissions</h4>
                  {intern.submissions.length === 0 ? (
                    <p style={{ color: "gray" }}>No submissions yet</p>
                  ) : (
                    <table style={styles.submissionTable}>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Docs</th>
                          <th>LeetCode</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {intern.submissions.map((sub) => (
                          <tr key={sub.day}>
                            <td><strong>Day {sub.day}</strong></td>
                            <td>
                              {sub.daily_doc_url ? (
                                <a href={sub.daily_doc_url} target="_blank" rel="noreferrer">
                                  📄 View
                                </a>
                              ) : (
                                <span style={{ color: "gray" }}>-</span>
                              )}
                            </td>
                            <td>
                              {sub.leetcode_pdf ? (
                                <a href={sub.leetcode_pdf} target="_blank" rel="noreferrer">
                                  📋 View
                                </a>
                              ) : (
                                <span style={{ color: "gray" }}>-</span>
                              )}
                            </td>
                            <td>
                              {sub.leet_approved ? (
                                <span style={styles.approved}>✓ Approved</span>
                              ) : sub.leetcode_pdf ? (
                                <span style={styles.pending}>⏳ Pending</span>
                              ) : (
                                <span style={styles.notSubmitted}>○ Not Submitted</span>
                              )}
                            </td>
                            <td>
                              {sub.leetcode_pdf && !sub.leet_approved && (
                                <>
                                  <button
                                    style={styles.approveBtn}
                                    onClick={() => handleApprove(sub.id)}
                                  >
                                    ✓
                                  </button>
                                  <button
                                    style={styles.rejectBtn}
                                    onClick={() => handleReject(sub.id)}
                                  >
                                    ✗
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  <h4>📚 Blogs</h4>
                  <p>{intern.blogs} blog(s) submitted</p>

                  <h4>🚀 Final Project</h4>
                  <p>
                    Status: {intern.final_project.submitted ? "Submitted ✓" : "Not Submitted ○"}
                    {intern.final_project.submitted && (
                      <>
                        <br />
                        Approved: {intern.final_project.approved ? "Yes ✓" : "No ✗"}
                        {intern.final_project.github_link && (
                          <>
                            <br />
                            <a href={intern.final_project.github_link} target="_blank" rel="noreferrer">
                              GitHub
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Leaderboard */}
      <div style={styles.card}>
        <h2>🏆 Intern Leaderboard</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Register No</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((user, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{user.name}</td>
                <td>{user.reg_no}</td>
                <td><strong>{user.points}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f5f7fb",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },

  title: {
    color: "#5a4fcf",
    marginBottom: "20px",
    fontSize: "28px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "20px",
  },

  internCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    marginBottom: "12px",
    overflow: "hidden",
  },

  internHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 15px",
    background: "#f9f9f9",
    cursor: "pointer",
    userSelect: "none",
  },

  pointsBadge: {
    background: "#5a4fcf",
    color: "white",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "0.85em",
    fontWeight: "bold",
  },

  internDetails: {
    padding: "15px",
    background: "#fafafa",
    borderTop: "1px solid #e0e0e0",
  },

  submissionTable: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    fontSize: "0.9em",
  },

  approved: {
    color: "#22c55e",
    fontWeight: "bold",
  },

  pending: {
    color: "#f59e0b",
    fontWeight: "bold",
  },

  notSubmitted: {
    color: "#999",
  },

  approveBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    marginRight: "4px",
    cursor: "pointer",
    fontSize: "0.8em",
  },

  rejectBtn: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8em",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
  },
};