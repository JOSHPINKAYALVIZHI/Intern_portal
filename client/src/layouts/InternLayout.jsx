import React from "react";
import Navbar from "../components/common/Navbar";

export default function InternLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        {children}
      </div>
    </div>
  );
}