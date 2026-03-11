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

<div className="p-6">

{/* Profile Card */}

<div className="bg-white shadow-xl rounded-xl p-6 mb-8">

<h2 className="text-2xl font-bold mb-6">
Intern Profile
</h2>

<div className="grid md:grid-cols-2 gap-6">

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">Name</p>
<p className="font-semibold text-lg">{profile.name}</p>
</div>

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">Roll Number</p>
<p className="font-semibold text-lg">{profile.reg_no}</p>
</div>

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">Department / Domain</p>
<p className="font-semibold text-lg">{profile.domain}</p>
</div>

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">College Email</p>
<p className="font-semibold text-lg">{profile.college_email}</p>
</div>

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">LinkedIn</p>

<a
href={profile.linkedin}
target="_blank"
rel="noreferrer"
className="text-blue-600 underline"
>
View Profile
</a>

</div>

<div className="bg-purple-50 p-4 rounded-lg">
<p className="text-gray-500 text-sm">GitHub</p>

<a
href={profile.github}
target="_blank"
rel="noreferrer"
className="text-blue-600 underline"
>
View GitHub
</a>

</div>

<div className="bg-purple-100 p-4 rounded-lg md:col-span-2 text-center">

<p className="text-gray-500 text-sm">
Total Internship Points
</p>

<p className="text-2xl font-bold text-purple-600">
{profile.total_points}
</p>

</div>

</div>

</div>


{/* 21 Day Progress Grid */}

<div className="bg-white shadow-xl rounded-xl p-6">

<h3 className="text-lg font-semibold mb-4">
21-Day Internship Progress
</h3>

<div className="grid grid-cols-7 gap-3">

{roadmap.map((d) => (

<div
key={d.day}
className={`p-3 rounded text-center font-medium ${
d.status === "complete"
? "bg-green-500 text-white"
: d.status === "partial"
? "bg-yellow-400 text-white"
: "bg-purple-100"
}`}
>

Day {d.day}

</div>

))}

</div>

</div>

</div>

  );
}