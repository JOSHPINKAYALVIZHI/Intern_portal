import { useState, useEffect } from "react";
import API from "../../api/api";

export default function UploadBox({ activity }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [currentDay, setCurrentDay] = useState(null);

  // Detect first incomplete day
  useEffect(() => {
    if (activity) {
      const nextDay = activity.find(
        (day) => day.status !== "full_complete"
      );
      if (nextDay) {
        setCurrentDay(nextDay.day);
      }
    }
  }, [activity]);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a PDF file");
      return;
    }

    if (!currentDay) {
      setMessage("All days completed 🎉");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post(
        `/intern/upload-leetcode/${currentDay}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.msg);
    } catch (err) {
      setMessage(err.response?.data?.msg || "Upload failed");
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md">
      <h3 className="text-xl text-accent mb-2">
        Upload LeetCode PDF 📄
      </h3>

      {currentDay && (
        <p className="text-sm mb-4 text-textDark">
          Current Active Day: <b>Day {currentDay}</b>
        </p>
      )}

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl transition"
      >
        Upload
      </button>

      {message && (
        <p className="mt-3 text-sm text-textDark">{message}</p>
      )}
    </div>
  );
}