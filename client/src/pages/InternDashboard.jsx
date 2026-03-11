import React, { useEffect, useState } from "react";
import API from "../api/api";
import InternLayout from "../layouts/InternLayout";
import PointsCard from "../components/intern/PointsCard";
import { useNavigate } from "react-router-dom";

export default function InternDashboard() {

  const [data, setData] = useState(null);
  const [files, setFiles] = useState({});
  const [docs, setDocs] = useState({});
  const [blogLinks, setBlogLinks] = useState({});

  const navigate = useNavigate();

  /* -----------------------------
     FETCH DASHBOARD
  ----------------------------- */

  const fetchDashboard = async () => {

  try {

    const res = await API.get("/dashboard");

    if (!res.data.profile_complete) {
      navigate("/setup-profile");
      return;
    }

    setData(res.data);

  } catch (err) {

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }

  }

};

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (!data) return <p>Loading...</p>;

  const activity = data.activity_grid || [];
  const completedDays = activity.filter(
  (a) => a.status === "complete"
).length;

const totalDays = 21;

const progressPercent = Math.round(
  (completedDays / totalDays) * 100
);
  const roadmap = data.roadmap || [];

  /* -----------------------------
     LEETCODE FILE HANDLING
  ----------------------------- */

  const handleFileChange = (day, e) => {

    setFiles({
      ...files,
      [day]: e.target.files[0]
    });

  };

  const uploadLeetCode = async (day) => {

    const file = files[day];

    if (!file) {
      alert("Choose LeetCode PDF first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await API.post(`/intern/upload-leetcode/${day}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    alert("LeetCode uploaded successfully");

    fetchDashboard();
  };

  /* -----------------------------
     DAILY DOCUMENT HANDLING
  ----------------------------- */

  const handleDocChange = (day, e) => {

    setDocs({
      ...docs,
      [day]: e.target.files[0]
    });

  };

  const uploadDailyDoc = async (day) => {

    const file = docs[day];

    if (!file) {
      alert("Choose daily document first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    await API.post(`/intern/upload-daily-doc/${day}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });

    alert("Daily document uploaded successfully");

    fetchDashboard();
  };

  /* -----------------------------
     BLOG SUBMISSION
  ----------------------------- */

  const submitBlog = async (day) => {

    const link = blogLinks[day];

    if (!link) {
      alert("Enter Medium blog link");
      return;
    }

    await API.post("/intern/add-blog", {
      date: new Date().toISOString().split("T")[0],
      link
    });

    alert("Blog submitted!");

    fetchDashboard();
  };

  return (

    <InternLayout>

      {/* WELCOME */}

      <h2 className="text-3xl text-accent mb-6">
        Welcome {data.profile.name}
      </h2>

      {/* POINTS CARDS */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">

        <PointsCard
          title="Points"
          value={data.profile.total_points}
        />

        <PointsCard
          title="Domain"
          value={data.profile.domain}
        />

        <PointsCard
          title="Blogs"
          value={data.blog_count}
        />

      </div>

      {/* DOMAIN ROADMAP */}

      <div className="bg-white shadow rounded-xl p-8 mt-6">

        <h2 className="text-2xl font-semibold mb-6">
          Domain Learning Roadmap
        </h2>

        <div className="relative">

{/* Center vertical line */}
<div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-purple-300"></div>

{roadmap.map((r,index)=>(

<div
key={index}
className={`mb-16 flex items-center ${
index % 2 === 0 ? "justify-start" : "justify-end"
}`}
>

{/* Left Card */}
{index % 2 === 0 && (

<div className="w-5/12 pr-8 text-right">

<div className="bg-gray-50 p-5 rounded-xl shadow-lg hover:scale-105 transition">

<p className="text-purple-600 font-semibold">{r.phase}</p>

<h3 className="text-lg font-bold mt-1">{r.title}</h3>

<p className="text-gray-600 mt-2">{r.description}</p>

</div>

</div>

)}

{/* Timeline Node */}

<div className="relative flex items-center justify-center w-2/12">

<div className="w-5 h-5 bg-purple-500 rounded-full shadow-lg shadow-purple-400/50 z-10"></div>

</div>

{/* Right Card */}

{index % 2 !== 0 && (

<div className="w-5/12 pl-8">

<div className="bg-gray-50 p-5 rounded-xl shadow-lg hover:scale-105 transition">

<p className="text-purple-600 font-semibold">{r.phase}</p>

<h3 className="text-lg font-bold mt-1">{r.title}</h3>

<p className="text-gray-600 mt-2">{r.description}</p>

</div>

</div>

)}

</div>

))}

</div>
      </div>

      {/* DAILY TASKS */}

<div className="bg-white shadow rounded-xl p-6 mt-6">

<h2 className="text-xl font-semibold mb-4">
Daily Internship Tasks
</h2>

{activity.map((d) => (

<details key={d.day} className="mb-4 border rounded-lg">

<summary className="p-3 cursor-pointer font-medium bg-gray-100">
Day {d.day}
</summary>

<div className="p-4 space-y-4">
{d.day !== 21 ? (

<div className="flex items-center gap-8 flex-wrap">

{/* Docs Upload */}

<div className="flex items-center gap-2">
<span className="font-medium">Docs</span>

<input
type="file"
onChange={(e)=>handleDocChange(d.day,e)}
className="border p-1 rounded"
/>

<button
onClick={()=>uploadDailyDoc(d.day)}
className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
>
Upload
</button>
</div>


{/* LeetCode Upload */}

<div className="flex items-center gap-2">
<span className="font-medium">LeetCode</span>

<input
type="file"
onChange={(e)=>handleFileChange(d.day,e)}
className="border p-1 rounded"
/>

<button
onClick={()=>uploadLeetCode(d.day)}
className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1 rounded"
>
Upload
</button>
</div>

</div>

) : (

<div className="space-y-4">

<h3 className="font-semibold text-lg text-purple-600">
Final Project Submission
</h3>

<input
type="text"
placeholder="GitHub Repository Link"
className="border p-2 rounded w-full"
/>

<input
type="text"
placeholder="Live Deployment Link"
className="border p-2 rounded w-full"
/>

<input
type="text"
placeholder="Demo Video Link"
className="border p-2 rounded w-full"
/>

<button
className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded"
>
Submit Final Project
</button>

</div>

)}



{/* Status */}

<div className="text-sm">

<span className="font-semibold">Status :</span>{" "}

<span
className={`px-2 py-1 rounded text-white text-xs ${
d.status === "complete"
? "bg-green-500"
: d.status === "partial"
? "bg-yellow-500"
: "bg-gray-400"
}`}
>
{d.status}
</span>

</div>


{/* Weekly Blog */}

{d.day % 7 === 0 && (

<div className="border-t pt-4">

<h4 className="font-semibold mb-2">
Weekly Medium Blog
</h4>

<input
type="text"
placeholder="Paste Medium blog link"
className="border p-2 rounded w-72"
onChange={(e)=>setBlogLinks({
...blogLinks,
[d.day]: e.target.value
})}
/>

<button
onClick={()=>submitBlog(d.day)}
className="ml-3 bg-purple-500 text-white px-4 py-2 rounded"
>
Submit Blog
</button>

</div>

)}

</div>

</details>

))}



</div>
    </InternLayout>

  );
}