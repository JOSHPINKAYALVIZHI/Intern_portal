import React, { useEffect, useState } from "react";
import API from "../api/api";

export default function Profile() {

  const [roadmap, setRoadmap] = useState([]);
  const [profile, setProfile] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const res = await API.get("/dashboard");

    setProfile(res.data.profile);
    setRoadmap(res.data.activity_grid);
  };

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Profile
      </h1>

      <div className="bg-white shadow rounded-xl p-6 mb-6">

        <p><b>Name:</b> {profile.name}</p>
        <p><b>Domain:</b> {profile.domain}</p>
        <p><b>Total Points:</b> {profile.total_points}</p>

      </div>

      <h2 className="text-xl font-semibold mb-4">
        21-Day Roadmap
      </h2>

      <div className="grid grid-cols-7 gap-3">

        {roadmap.map((day) => (
          <div
            key={day.day}
            className="bg-purple-100 p-4 rounded-lg text-center"
          >
            <div className="font-bold">Day {day.day}</div>
          </div>
        ))}

      </div>

    </div>
  );
}