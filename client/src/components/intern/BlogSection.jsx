import React from "react";
import { useState } from "react";
import API from "../../api/api";

export default function BlogSection({ refreshDashboard }) {
  const [link, setLink] = useState("");
  const [date, setDate] = useState("");

  const submitBlog = async () => {
    await API.post("/intern/add-blog", { link, date });
    refreshDashboard();
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md mt-8">
      <h3 className="text-xl text-accent mb-4">Submit Blog 📝</h3>

      <input
        type="date"
        className="block mb-3 p-2 border rounded"
        onChange={(e) => setDate(e.target.value)}
      />

      <input
        placeholder="Medium Link"
        className="block mb-3 p-2 border rounded w-full"
        onChange={(e) => setLink(e.target.value)}
      />

      <button
        onClick={submitBlog}
        className="bg-primary text-white px-4 py-2 rounded"
      >
        Submit Blog
      </button>
    </div>
  );
}