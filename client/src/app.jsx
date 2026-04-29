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
     <div className="flex flex-col min-h-screen bg-background">
      {/* <img 
        src="/logo.png" 
        alt="IPS Tech Community"
        className="fixed top-4 left-4 w-12 z-50"
      /> */}
          
        
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute role="INTERN"><InternDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/setup-profile" element={<ProfileSetup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile-edit" element={<ProtectedRoute role="INTERN"><ProfileEdit /></ProtectedRoute>} />
        
      </Routes>
      {/* 🔻 FOOTER */}
       <footer className="text-center p-3 text-sm text-muted bg-card">
          Powered by <span className="text-primary font-medium">IPS TECH COMMUNITY</span>
        </footer> 
      </div>
    </BrowserRouter>
  );
}

export default App;