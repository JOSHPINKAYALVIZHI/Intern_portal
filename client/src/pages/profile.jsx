import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// Helper function to format social links
const formatSocialLink = (link, platform) => {
  if (!link) return "";
  if (link.startsWith("http://") || link.startsWith("https://")) {
    return link;
  }
  // If it's just a username, create the full URL
  if (platform === "github") {
    return `https://github.com/${link}`;
  } else if (platform === "linkedin") {
    return `https://linkedin.com/in/${link}`;
  }
  return link;
};

export default function Profile() {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState([]);
  const [profile, setProfile] = useState({});
  const [submissions, setSubmissions] = useState([]);
  const [showSubmissions, setShowSubmissions] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSubmissions();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/dashboard");
       console.log( res.data);
       console.log(profile
       )
      setProfile(res.data.profile);
      setRoadmap(res.data.activity_grid);
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await API.get("/intern/my-submissions");
      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  return (

<div className="p-6">

{/* Profile Card */}

<div className="bg-white shadow-xl rounded-xl p-6 mb-8">

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
  <h2 className="text-2xl font-bold">
    Intern Profile
  </h2>
  <button
    onClick={() => navigate("/profile-edit")}
    style={{
      background: "#0a1f3f",
      color: "#fff",
      border: "none",
      padding: "8px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "14px"
    }}
  >
    Edit Profile
  </button>
</div>

<div className="grid md:grid-cols-2 gap-6">

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">Name</p>
<p className="font-semibold text-lg">{profile.name}</p>
</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">Roll Number</p>
<p className="font-semibold text-lg">{profile.reg_no}</p>
</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">Department</p>
<p className="font-semibold text-lg">{profile.department}</p>
</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">Department / Domain</p>
<p className="font-semibold text-lg">{profile.domain}</p>
</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">College Email</p>
<p className="font-semibold text-lg">{profile.college_email}</p>
</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">LinkedIn</p>

<a
href={formatSocialLink(profile.linkedin, "linkedin")}
target="_blank"
rel="noreferrer"
style={{ color: "#0a1f3f", textDecoration: "underline" }}
>
View Profile
</a>

</div>

<div style={{ background: "#f5f1e8", padding: "16px", borderRadius: "8px" }}>
<p className="text-gray-500 text-sm">GitHub</p>

<a
href={formatSocialLink(profile.github, "github")}
target="_blank"
rel="noreferrer"
style={{ color: "#0a1f3f", textDecoration: "underline" }}
>
View GitHub
</a>

</div>

<div style={{ background: "#e8dcc8", padding: "16px", borderRadius: "8px", gridColumn: "span 2", textAlign: "center" }}>

<p className="text-gray-500 text-sm">
Total Internship Points
</p>

<p style={{ fontSize: "24px", fontWeight: "bold", color: "#0a1f3f" }}>
{profile.total_points}
</p>

</div>

</div>

</div>

{/* My Submissions Section */}
<div className="bg-white shadow-xl rounded-xl p-6 mb-8">
  <button
    onClick={() => setShowSubmissions(!showSubmissions)}
    style={{
      background: "#0a1f3f",
      color: "#fff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "16px",
      marginBottom: "15px"
    }}
  >
    {showSubmissions ? "Hide My Submissions" : "View My Submissions"}
  </button>

  {showSubmissions && (
    <div style={{ marginTop: "20px" }}>
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px" }}>
        Your Daily Submissions (All 21 Days)
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "14px"
        }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Day</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Daily Doc</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>LeetCode PDF</th>

              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Blog</th>

              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Approved</th>
              <th style={{ padding: "10px", border: "1px solid #ddd", textAlign: "left" }}>Points</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr key={sub.day}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>Day {sub.day}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {sub.daily_doc_url ? (
                    <a href={sub.daily_doc_url} target="_blank" rel="noreferrer" style={{ color: "#0a1f3f", textDecoration: "none", fontWeight: "bold" }}>
                      View Doc
                    </a>
                  ) : (
                    <span style={{ color: "#999" }}>-</span>
                  )}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {sub.leetcode_pdf ? (
                    <a href={sub.leetcode_pdf} target="_blank" rel="noreferrer" style={{ color: "#0a1f3f", textDecoration: "none", fontWeight: "bold" }}>
                      View PDF
                    </a>
                  ) : (
                    <span style={{ color: "#999" }}>-</span>
                  )}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
  {sub.blog_link ? (
    <a
      href={sub.blog_link}
      target="_blank"
      rel="noreferrer"
      style={{
        color: "#0a1f3f",
        textDecoration: "none",
        fontWeight: "bold"
      }}
    >
      View Blog
    </a>
  ) : (
    <span style={{ color: "#999" }}>-</span>
  )}
</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {sub.leet_approved ? (
                    <span style={{ color: "#22c55e", fontWeight: "bold" }}>Yes</span>
                  ) : (
                    <span style={{ color: "#f59e0b", fontWeight: "bold" }}>Pending</span>
                  )}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{sub.leet_points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )}
</div>

{/* 21 Day Progress Grid */}

<div className="bg-white shadow-xl rounded-xl p-6">

<h3 className="text-lg font-semibold mb-4">
21-Day Internship Progress
</h3>

<div className="grid grid-cols-7 gap-3">

{roadmap.map((d) => (

<div
key={d.day}
className={`p-3 rounded text-center font-medium ${
d.status === "complete"
? "bg-green-500 text-white"
: d.status === "partial"
? "bg-yellow-400 text-white"
: ""
}`}
style={d.status !== "complete" && d.status !== "partial" ? { background: "#f5f1e8", color: "#333" } : {}}
>

Day {d.day}

</div>

))}

</div>

</div>

</div>

  );
}