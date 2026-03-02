import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-pastelGradient flex flex-col justify-center items-center text-center animate-fadeIn">

      <h1 className="text-5xl font-bold text-accent mb-6 animate-float">
        Intern Portal 💜
      </h1>

      <p className="text-muted mb-8 max-w-xl">
        21-Day Internship Program with Real-time Progress Tracking,
        MCQs, LeetCode, Blogs & Final Project Submission.
      </p>

      <button
  onClick={() => navigate("/login")}
  className="bg-primary text-white px-8 py-3 rounded-xl"
>
  Get Started
</button>

    </div>
  );
}