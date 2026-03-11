import React from "react";
import ApprovalPanel from "../components/admin/ApprovalPanel";
import InternTable from "../components/admin/InternTable";

export default function AdminDashboard() {

  return (

    <div className="min-h-screen bg-gray-50 p-10">

      <h1 className="text-3xl font-bold mb-8 text-purple-700">
        Admin Dashboard
      </h1>

      {/* Pending Approvals */}
      <div className="mb-10">
        <ApprovalPanel />
      </div>

      {/* Intern Leaderboard */}
      <div>
        <InternTable />
      </div>

    </div>

  );

}