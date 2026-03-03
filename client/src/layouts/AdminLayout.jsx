import React from "react";
import Navbar from "../components/common/Navbar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-background dark:bg-darkBackground transition">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}