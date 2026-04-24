import React from "react";
import { useEffect, useState } from "react";
import API from "../../api/api";
import confetti from "canvas-confetti";

export default function MCQSection({ activity, refreshDashboard }) {
  const [currentDay, setCurrentDay] = useState(null);

  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (activity) {
      const nextDay = activity.find(
        (day) => day.status !== "full_complete"
      );
      if (nextDay) {
        setCurrentDay(nextDay.day);
        setSubmitted(false);
      }
    }
  }, [activity]);

  useEffect(() => {
    if (currentDay) {
      API.get(`/intern/mcqs/${currentDay}`)
        .then(res => setMcqs(res.data));
    }
  }, [currentDay]);

  const handleChange = (id, option) => {
    if (!submitted) {
      setAnswers({ ...answers, [id]: option });
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await API.post(
        `/intern/submit-mcq/${currentDay}`,
        { answers }
      );

      setMessage(`Score: ${res.data.score}`);
      setSubmitted(true);

      confetti({
        particleCount: 80,
        spread: 70,
        colors: ["#C8B6FF", "#A78BFA"]
      });

      refreshDashboard(); // 🔥 Auto refresh

    } catch (err) {
      setMessage(err.response?.data?.msg || "Error");
    }
  };

  if (!currentDay) return null;

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md mt-8">
      <h3 className="text-xl text-accent mb-4">
        Day {currentDay} MCQs
      </h3>

      {mcqs.map((q) => (
        <div key={q.id} className="mb-4">
          <p className="mb-2 font-medium">{q.question}</p>

          {["A", "B", "C", "D"].map((opt) => (
            <label key={opt} className="block text-sm">
              <input
                type="radio"
                disabled={submitted}
                name={`question-${q.id}`}
                onChange={() => handleChange(q.id, opt)}
              />{" "}
              {q[`option_${opt.toLowerCase()}`]}
            </label>
          ))}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-xl transition"
        >
          Submit MCQs
        </button>
      )}

      {submitted && (
        <p className="mt-4 text-green-600 font-medium">
          Submitted Successfully
        </p>
      )}

      {message && (
        <p className="mt-2 text-sm text-textDark">{message}</p>
      )}
    </div>
  );
}