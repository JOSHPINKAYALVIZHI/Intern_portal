// api/api.js
import axios from "axios";


const API = axios.create({
  baseURL: "intern-portal-cyan.vercel.app
",
  withCredentials: true
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
