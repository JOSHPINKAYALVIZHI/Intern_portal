import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function InternTable() {

  const [users, setUsers] = useState([]);

  const fetchLeaderboard = async () => {

    const res = await API.get("/admin/leaderboard");

    setUsers(res.data);
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (

    <div className="bg-white shadow p-6 rounded-xl">

      <h2 className="text-xl font-semibold mb-4">
        Intern Leaderboard
      </h2>

      <table className="w-full">

        <thead>

          <tr className="border-b">

            <th className="p-2 text-left">Rank</th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Register No</th>
            <th className="p-2 text-left">Points</th>

          </tr>

        </thead>

        <tbody>

          {users.map((u, i) => (

            <tr key={i} className="border-b">

              <td className="p-2">{i + 1}</td>

              <td className="p-2">{u.name}</td>

              <td className="p-2">{u.reg_no}</td>

              <td className="p-2 font-semibold">{u.points}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}