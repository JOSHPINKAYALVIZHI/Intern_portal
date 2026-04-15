import React,{ useEffect, useState } from "react";
import API from "../../api/api";


export default function InternTable() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await API.get("/admin/leaderboard");
        console.log("Response:", response.data); // Debug log
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error:", error);
        setUsers([]);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="card">
      <h3>Intern Leaderboard</h3>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Register No</th>
            <th>Points</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{u.name}</td>
              <td>{u.reg_no}</td>
              <td>{u.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}