import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function AdminDashboard() {
  const [interns, setInterns] = useState([]);
  const [expandedIntern, setExpandedIntern] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState("interns");
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Create User State
  const [newUserForm, setNewUserForm] = useState({
    name: "",
    password: ""
  });
  const [createUserMessage, setCreateUserMessage] = useState("");

  // Attendance Form State
  const [attendanceForm, setAttendanceForm] = useState({
    user_id: "",
    day_number: "",
    status: "in"
  });
  const [attendanceMessage, setAttendanceMessage] = useState("");

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

  // Create new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/admin/create-user", newUserForm);
      setCreateUserMessage("User created successfully!");
      setNewUserForm({
        name: "",
        password: ""
      });
      fetchData();
      setTimeout(() => setCreateUserMessage(""), 3000);
    } catch (err) {
      setCreateUserMessage("Error: " + (err.response?.data?.msg || "Failed to create user"));
    }
  };

  // Log attendance
  const handleLogAttendance = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post("/admin/log-attendance", attendanceForm);
      setAttendanceMessage("✓ Attendance logged!");
      setAttendanceForm({ user_id: "", day_number: "", status: "in" });
      setTimeout(() => setAttendanceMessage(""), 2000);
    } catch (err) {
      setAttendanceMessage("✗ Error: " + (err.response?.data?.msg || "Failed to log attendance"));
    }
  };

  // Get attendance for intern
  const viewAttendance = async (userId) => {
    setLoading(true);
    try {
      const response = await API.get(`/admin/attendance/${userId}`);
      setAttendanceData(response.data);
      setSelectedInternId(userId);
      setActiveTab("attendance");
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Export to CSV
  const handleExportAttendance = async () => {
    try {
      const response = await API.get("/admin/export-attendance", {
        responseType: "blob"
      });
      // Create a blob from the response
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export attendance");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div style={styles.tabNavigation}>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "interns" ? styles.tabBtnActive : {})
          }}
          onClick={() => setActiveTab("interns")}
        >
          Interns
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "attendance" ? styles.tabBtnActive : {})
          }}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "createUser" ? styles.tabBtnActive : {})
          }}
          onClick={() => setActiveTab("createUser")}
        >
          Create User
        </button>
        <button
          style={{
            ...styles.tabBtn,
            ...(activeTab === "leaderboard" ? styles.tabBtnActive : {})
          }}
          onClick={() => setActiveTab("leaderboard")}
        >
          Leaderboard
        </button>
      </div>

      {/* Tab Content */}

      {/* ==================== INTERNS TAB ==================== */}
      {activeTab === "interns" && (
        <div style={styles.card}>
          <h2>All Interns - Detailed View</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.largeTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Department</th>
                  <th>Domain</th>
                  <th>Email</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => (
                  <tr key={intern.user_id}>
                    <td>{intern.name}</td>
                    <td>{intern.reg_no}</td>
                    <td>{intern.department || "Unknown"}</td>
                    <td>{intern.domain}</td>
                    <td>{intern.college_email}</td>
                    <td style={{ fontWeight: "bold", color: "#0a1f3f" }}>
                      {intern.total_points}
                    </td>
                    <td>
                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          setExpandedIntern(
                            expandedIntern === intern.user_id ? null : intern.user_id
                          )
                        }
                      >
                        {expandedIntern === intern.user_id ? "Hide" : "View"}
                      </button>
                      <button
                        style={styles.attendanceBtn}
                        onClick={() => viewAttendance(intern.user_id)}
                      >
                        Attendance
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded View for Day-wise Submissions */}
          {expandedIntern !== null && (
            <div style={styles.expandedSection}>
              <div style={styles.internSubmissionHeader}>
                <h3>
                  Day-wise Submissions for{" "}
                  {interns.find((i) => i.user_id === expandedIntern)?.name}
                </h3>
                <button
                  style={styles.closeBtn}
                  onClick={() => setExpandedIntern(null)}
                >
                  X
                </button>
              </div>
              <div style={styles.submissionTableWrapper}>
                <table style={styles.submissionTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Daily Doc</th>
                      <th>LeetCode PDF</th>
                      <th>Approved</th>
                      <th>Points</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interns
                      .find((i) => i.user_id === expandedIntern)
                      ?.submissions.sort((a, b) => a.day_number - b.day_number)
                      .map((sub) => (
                        <tr key={sub.id}>
                          <td>Day {sub.day_number}</td>
                          <td>
                            {sub.daily_doc_url ? (
                              <a
                                href={sub.daily_doc_url}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.link}
                              >
                                View Doc
                              </a>
                            ) : (
                              <span style={styles.notSubmitted}>-</span>
                            )}
                          </td>
                          <td>
                            {sub.leetcode_pdf ? (
                              <a
                                href={sub.leetcode_pdf}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.link}
                              >
                                View PDF
                              </a>
                            ) : (
                              <span style={styles.notSubmitted}>-</span>
                            )}
                          </td>
                          <td>
                            {sub.leet_approved ? (
                              <span style={styles.approved}>Yes</span>
                            ) : (
                              <span style={styles.pending}>No</span>
                            )}
                          </td>
                          <td>{sub.leet_points}</td>
                          <td>
                            {sub.leetcode_pdf && !sub.leet_approved && (
                              <>
                                <button
                                  style={styles.approveBtn}
                                  onClick={() => handleApprove(sub.id)}
                                >
                                  Approve
                                </button>
                                <button
                                  style={styles.rejectBtn}
                                  onClick={() => handleReject(sub.id)}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ATTENDANCE TAB ==================== */}
      {activeTab === "attendance" && (
        <div style={styles.card}>
          <div style={styles.attendanceHeader}>
            <h2>Attendance Management</h2>
            <button style={styles.exportBtn} onClick={handleExportAttendance}>
              Export to Excel
            </button>
          </div>

          {/* Log Attendance Form */}
          <div style={styles.formSection}>
            <h3>Log Attendance</h3>
            <form onSubmit={handleLogAttendance} style={styles.form}>
              <select
                style={styles.input}
                value={attendanceForm.user_id}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    user_id: e.target.value
                  })
                }
                required
              >
                <option value="">Select Intern</option>
                {interns.map((intern) => (
                  <option key={intern.user_id} value={intern.user_id}>
                    {intern.name} ({intern.reg_no})
                  </option>
                ))}
              </select>

              <select
                style={styles.input}
                value={attendanceForm.day_number}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    day_number: e.target.value
                  })
                }
                required
              >
                <option value="">Select Day (1-21)</option>
                {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>

              <select
                style={styles.input}
                value={attendanceForm.status}
                onChange={(e) =>
                  setAttendanceForm({
                    ...attendanceForm,
                    status: e.target.value
                  })
                }
              >
                <option value="in">Entry (In)</option>
                <option value="out">Exit (Out)</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
              </select>

              <button type="submit" style={styles.submitBtn}>
                Log Attendance
              </button>
            </form>
            {attendanceMessage && (
              <p style={styles.message}>{attendanceMessage}</p>
            )}
          </div>

          {/* View Attendance */}
          {selectedInternId && attendanceData && (
            <div style={styles.attendanceViewSection}>
              <h3>
                Attendance for {attendanceData.name} ({attendanceData.reg_no})
              </h3>
              <div style={styles.submissionTableWrapper}>
                <table style={styles.submissionTable}>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Entry Time</th>
                      <th>Exit Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.attendance.map((record) => (
                      <tr key={record.day}>
                        <td>Day {record.day}</td>
                        <td>{record.entry_time ? new Date(record.entry_time).toLocaleTimeString() : "-"}</td>
                        <td>{record.exit_time ? new Date(record.exit_time).toLocaleTimeString() : "-"}</td>
                        <td style={{ fontWeight: "bold" }}>{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== CREATE USER TAB ==================== */}
      {activeTab === "createUser" && (
        <div style={styles.card}>
          <h2>Create New Intern</h2>
          <form onSubmit={handleCreateUser} style={styles.createUserForm}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>Name *</label>
                <input
                  style={styles.input}
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) =>
                    setNewUserForm({ ...newUserForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label style={styles.label}>Password *</label>
                <input
                  style={styles.input}
                  type="password"
                  value={newUserForm.password}
                  onChange={(e) =>
                    setNewUserForm({
                      ...newUserForm,
                      password: e.target.value
                    })
                  }
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.submitBtn}>
              Create User
            </button>
          </form>
          {createUserMessage && (
            <p style={styles.message}>{createUserMessage}</p>
          )}
        </div>
      )}

      {/* ==================== LEADERBOARD TAB ==================== */}
      {activeTab === "leaderboard" && (
        <div style={styles.card}>
          <h2>Intern Leaderboard</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.largeTable}>
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
                    <td style={styles.rankCell}>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.reg_no}</td>
                    <td style={{ fontWeight: "bold", color: "#0a1f3f" }}>
                      {user.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f5f1e8",
    minHeight: "100vh",
    fontFamily: "sans-serif"
  },
  title: {
    color: "#0a1f3f",
    marginBottom: "20px",
    fontSize: "28px"
  },
  tabNavigation: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },
  tabBtn: {
    padding: "10px 20px",
    border: "2px solid #ddd",
    background: "#fff",
    color: "#333",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s",
    fontSize: "14px",
    fontWeight: "bold"
  },
  tabBtnActive: {
    background: "#0a1f3f",
    color: "#fff",
    borderColor: "#0a1f3f"
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    marginBottom: "20px"
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "15px"
  },
  largeTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    marginTop: "10px"
  },
  submissionTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
    marginTop: "10px"
  },
  submissionTableWrapper: {
    overflowX: "auto",
    marginTop: "15px"
  },
  expandedSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0"
  },
  internSubmissionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "15px"
  },
  closeBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px"
  },
  viewBtn: {
    background: "#0a1f3f",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "5px",
    fontSize: "12px"
  },
  attendanceBtn: {
    background: "#0a1f3f",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  approveBtn: {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    marginRight: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  rejectBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    padding: "4px 8px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px"
  },
  approved: {
    color: "#22c55e",
    fontWeight: "bold"
  },
  pending: {
    color: "#f59e0b",
    fontWeight: "bold"
  },
  notSubmitted: {
    color: "#999"
  },
  link: {
    color: "#0a1f3f",
    textDecoration: "none",
    cursor: "pointer",
    fontWeight: "bold"
  },
  formSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px"
  },
  form: {
    display: "flex",
    gap: "10px",
    marginTop: "10px",
    flexWrap: "wrap"
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    flex: "1",
    minWidth: "150px"
  },
  submitBtn: {
    background: "#0a1f3f",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  },
  exportBtn: {
    background: "#10b981",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px"
  },
  message: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "4px",
    background: "#f0ede5",
    color: "#0a1f3f",
    fontSize: "14px"
  },
  attendanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  attendanceViewSection: {
    marginTop: "20px",
    padding: "20px",
    background: "#f9f9f9",
    borderRadius: "8px"
  },
  createUserForm: {
    marginTop: "15px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
    marginBottom: "15px"
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px"
  },
  rankCell: {
    fontWeight: "bold",
    color: "#0a1f3f",
    fontSize: "16px"
  }
};