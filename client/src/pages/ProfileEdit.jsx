import React, { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    college_email: "",
    linkedin: "",
    github: ""
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/dashboard");
      const profileData = res.data.profile;
      setProfile({
        name: profileData.name || "",
        college_email: profileData.college_email || "",
        linkedin: profileData.linkedin || "",
        github: profileData.github || ""
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setMessage("Error loading profile");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setMessage("");

    try {
      const res = await API.post("/intern/update-profile", profile);
      setMessage("Profile updated successfully!");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      setMessage("Error updating profile: " + (err.response?.data?.msg || "Unknown error"));
    }
    setSaveLoading(false);
  };

  if (loading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Edit Your Profile</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>College Email</label>
            <input
              style={styles.input}
              type="email"
              name="college_email"
              value={profile.college_email}
              onChange={handleChange}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>LinkedIn Profile</label>
            <input
              style={styles.input}
              type="text"
              name="linkedin"
              value={profile.linkedin}
              onChange={handleChange}
              placeholder="e.g., john-doe or https://linkedin.com/in/john-doe"
            />
            <p style={styles.hint}>
              You can enter your LinkedIn username or full profile URL
            </p>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>GitHub Profile</label>
            <input
              style={styles.input}
              type="text"
              name="github"
              value={profile.github}
              onChange={handleChange}
              placeholder="e.g., johndoe or https://github.com/johndoe"
            />
            <p style={styles.hint}>
              You can enter your GitHub username or full profile URL
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="submit"
              style={styles.saveBtn}
              disabled={saveLoading}
            >
              {saveLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              style={styles.cancelBtn}
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
          </div>
        </form>

        {message && (
          <p style={{
            ...styles.message,
            ...(message.includes("✓") ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    background: "#f5f1e8",
    minHeight: "100vh",
    fontFamily: "sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "50px"
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    maxWidth: "500px",
    width: "100%"
  },
  title: {
    color: "#0a1f3f",
    marginBottom: "25px",
    fontSize: "24px",
    textAlign: "center"
  },
  form: {
    display: "flex",
    flexDirection: "column"
  },
  formGroup: {
    marginBottom: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#333",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.3s",
    fontFamily: "inherit"
  },
  hint: {
    fontSize: "12px",
    color: "#999",
    marginTop: "5px"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px",
    marginTop: "25px"
  },
  saveBtn: {
    flex: 1,
    padding: "12px",
    background: "#0a1f3f",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background 0.3s"
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    background: "#ddd",
    color: "#333",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    transition: "background 0.3s"
  },
  message: {
    marginTop: "15px",
    padding: "12px",
    borderRadius: "6px",
    textAlign: "center",
    fontSize: "14px"
  },
  successMessage: {
    background: "#d1fae5",
    color: "#065f46"
  },
  errorMessage: {
    background: "#fee2e2",
    color: "#991b1b"
  }
};
