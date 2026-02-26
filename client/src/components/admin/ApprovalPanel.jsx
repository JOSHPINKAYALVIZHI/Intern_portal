import { useEffect, useState } from "react";
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
    fetchPending();
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md">
      <h3 className="text-xl text-accent mb-4">Pending Approvals</h3>

      {pending.map((item, i) => (
        <div key={i} className="flex justify-between mb-3">
          <span>User {item.user_id} - Day {item.day}</span>
          <button
            onClick={() => approve(item.user_id, item.day)}
            className="bg-primary text-white px-3 py-1 rounded"
          >
            Approve
          </button>
        </div>
      ))}
    </div>
  );
}