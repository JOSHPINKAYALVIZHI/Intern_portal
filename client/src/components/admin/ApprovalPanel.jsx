import React,{ useEffect, useState } from "react";
import API from "../../api/api";

export default function ApprovalPanel() {
  const [pending, setPending] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await API.get("/admin/pending-leetcode");
      setPending(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const approve = async (user_id, day) => {
    await API.post(`/admin/approve-leetcode/${user_id}/${day}`);
    fetchPending(); // refresh
  };

  const reject = async (user_id, day) => {
    await API.post(`/admin/reject-leetcode/${user_id}/${day}`);
    fetchPending();
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow">

      <h2 className="text-xl font-semibold mb-4">
        Pending LeetCode Approvals
      </h2>

      {pending.length === 0 ? (
        <p className="text-gray-500">🚀 No pending submissions</p>
      ) : (
        // pending.map((item) => (
        //   <div key={item.id} className="border-b py-3">

        //     <p className="font-medium">Day {item.day}</p>

        //     <a
        //       href={item.leetcode_pdf}
        //       target="_blank"
        //       className="text-blue-600 underline"
        //     >
        //       View PDF
        //     </a>

        //     <div className="mt-2">
        //       <button
        //         onClick={() => approve(item.user_id, item.day)}
        //         className="bg-green-500 text-white px-3 py-1 rounded mr-2"
        //       >
        //         Approve
        //       </button>

        //       <button
        //         onClick={() => reject(item.user_id, item.day)}
        //         className="bg-red-500 text-white px-3 py-1 rounded"
        //       >
        //         Reject
        //       </button>
        //     </div>

        //   </div>
        // )).
        pending.map((item) => (
          <div key={item.id} style={styles.pendingItem}>
    
    <div>
      <strong>{item.name}</strong><br />
      <small>{item.reg_no}</small><br />
      Day {item.day}<br />

      <a href={item.pdf} target="_blank">View PDF</a>
    </div>

    <div>
      <button onClick={() => handleApprove(item.id)}>
        Approve
      </button>

      <button onClick={() => handleReject(item.id)}>
        Reject
      </button>
    </div>

  </div>
))
      )}
    </div>
  );
}