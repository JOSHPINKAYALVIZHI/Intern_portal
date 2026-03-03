import React from "react";
import { useEffect, useState } from "react";
import API from "../api/api";

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    API.get("/admin/leaderboard").then(res => setLeaders(res.data));
  }, []);

  return (
    <div className="bg-background min-h-screen p-8">
      <h2 className="text-3xl text-accent mb-6">Leaderboard 🏆</h2>

      {leaders.map((user, index) => (
        <div
          key={index}
          className="bg-card p-4 mb-3 rounded-xl shadow-md flex justify-between"
        >
          <span>{index + 1}. {user.name}</span>
          <span>{user.points} pts</span>
        </div>
      ))}
    </div>
  );
}