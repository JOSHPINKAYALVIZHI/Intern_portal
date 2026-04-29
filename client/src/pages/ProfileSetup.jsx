import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    reg_no: "",
    domain: "",
    college_email: "",
    linkedin: "",
    github: ""
  });

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };

  const submitProfile = async () => {

    try {

      if (!form.name || !form.department || !form.reg_no || !form.domain) {
        alert("Please fill required fields");
        return;
      }

      console.log("Submitting profile:", form);

      await API.post("/intern/setup-profile", form);

      alert("Profile created successfully");

      navigate("/dashboard");

    } catch (error) {

      console.error(error);
      alert("Profile creation failed");

    }

  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">

      <div className="bg-card p-10 rounded-2xl shadow-xl w-[420px]">

        <h1 className="text-3xl font-bold text-accent mb-2">
          Welcome
        </h1>

        <p className="text-textDark mb-6">
          Please create your profile to start the internship journey.
        </p>

        <h2 className="text-xl font-semibold mb-4">
          Create Profile
        </h2>

        <div className="space-y-4">

          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <input
            name="department"
            placeholder="Department"
            value={form.department}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <input
            name="reg_no"
            placeholder="Register Number"
            value={form.reg_no}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <select
            name="domain"
            value={form.domain}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Select Domain</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="Web">Web Development</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="Data Science">Data Science</option>
          </select>

          <input
            name="college_email"
            placeholder="College Email"
            value={form.college_email}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <input
            name="linkedin"
            placeholder="LinkedIn URL"
            value={form.linkedin}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <input
            name="github"
            placeholder="GitHub URL"
            value={form.github}
            onChange={handleChange}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <button
            type="button"
            onClick={submitProfile}
            className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-xl font-semibold transition"
          >
            Save Profile
          </button>

        </div>

      </div>

    </div>
  );
}