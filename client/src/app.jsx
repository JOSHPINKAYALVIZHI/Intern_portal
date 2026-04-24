import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import InternDashboard from "./pages/InternDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/landing";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from  "./pages/profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute role="INTERN"><InternDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/setup-profile" element={<ProfileSetup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile-edit" element={<ProtectedRoute role="INTERN"><ProfileEdit /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;