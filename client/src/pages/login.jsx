import React, { useState, useContext } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {

  const [reg_no, setRegNo] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {

      const res = await API.post("/login", {
        reg_no,
        password
      });

      login(res.data.token, res.data.role);

      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.log(error);
      alert("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-background">

      <div className="bg-card p-8 rounded-2xl shadow-lg w-80">

        <h2 className="text-2xl mb-4 text-center">Login</h2>

        <input
          placeholder="Register No"
          className="w-full mb-3 p-2 border rounded"
          onChange={(e) => setRegNo(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary hover:bg-primaryHover text-white py-2 rounded-xl"
        >
          Login
        </button>

      </div>

    </div>
  );
}