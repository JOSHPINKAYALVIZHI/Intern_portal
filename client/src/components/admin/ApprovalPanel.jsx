import React, { useEffect, useState } from "react";
import API from "../../api/api";

export default function ApprovalPanel() {

  const [pending, setPending] = useState([]);

  const fetchPending = async () => {

    const res = await API.get("/admin/pending-leetcode");

    setPending(res.data);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (user_id, day) => {

    await API.post(`/admin/approve-leetcode/${user_id}/${day}`);

    alert("Approved");

    fetchPending();
  };

  return (

    <div className="bg-white shadow p-6 rounded-xl mb-8">

      <h2 className="text-xl font-semibold mb-4">
        Pending LeetCode Approvals
      </h2>

      {pending.length === 0 && (
        <p>No pending submissions</p>
      )}

      {pending.map((p, i) => (

        <div
          key={i}
          className="flex items-center justify-between border p-3 rounded mb-3"
        >

          <div>

            <p>User ID: {p.user_id}</p>

            <p>Day: {p.day}</p>

            <a
              href={`http://localhost:5000/${p.pdf}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600"
            >
              View PDF
            </a>

          </div>

          <button
            onClick={() => approve(p.user_id, p.day)}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Approve
          </button>

        </div>

      ))}

    </div>

  );
}