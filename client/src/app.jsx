import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import InternDashboard from "./pages/InternDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/landing";
import ProfileSetup from "./pages/ProfileSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<InternDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/setup-profile" element={<ProfileSetup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;