import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleDark = () => {
    setDark(!dark);
  };

  return (
    <nav className="bg-primary dark:bg-darkCard shadow-soft transition">
      <div className="max-w-6xl mx-auto flex justify-between items-center p-4">

        <h1 className="text-white text-xl font-semibold animate-fadeIn">
          Intern Portal 💜
        </h1>

        <div className="flex items-center gap-4">

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            className="bg-white/30 dark:bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl text-white hover:scale-105 transition"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="bg-white text-primary px-4 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}