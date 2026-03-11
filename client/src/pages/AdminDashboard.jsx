import React from "react";
import ApprovalPanel from "../components/admin/ApprovalPanel";
import InternTable from "../components/admin/InternTable";

export default function AdminDashboard() {

  return (

    <div className="p-10">

      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <ApprovalPanel />

      <InternTable />

    </div>

  );

}