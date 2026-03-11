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

        <div className="space-y-6">

          {activity.map((d, index) => (

<div
  key={d.day}
  className={`mb-10 flex ${
    index % 2 === 0 ? "justify-start" : "justify-end"
  }`}
>

  <div className="bg-gray-50 p-5 rounded-xl shadow-lg w-[45%]">

    <p className="text-purple-600 font-semibold">
      {d.phase}
    </p>

    <h3 className="text-lg font-bold mt-1">
      {d.title}
    </h3>

    <p className="text-gray-600 mt-2">
      {d.description}
    </p>

  </div>

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
              Task {d.day}
            </summary>

            <div className="p-4 space-y-4">

              {/* TASK BUTTONS */}

              <div className="flex flex-wrap items-center gap-6">

                {/* MCQ */}

                <button
                  className="bg-purple-500 text-white px-4 py-2 rounded-lg"
                >
                  Attempt MCQ
                </button>

                {/* DAILY DOCUMENT */}

                <div className="flex items-center gap-2">

                  <input
                    type="file"
                    onChange={(e) => handleDocChange(d.day, e)}
                  />

                  <button
                    onClick={() => uploadDailyDoc(d.day)}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Upload Daily Doc
                  </button>

                </div>

                {/* LEETCODE */}

                <div className="flex items-center gap-2">

                  <input
                    type="file"
                    onChange={(e) => handleFileChange(d.day, e)}
                  />

                  <button
                    onClick={() => uploadLeetCode(d.day)}
                    className="bg-purple-400 text-white px-4 py-2 rounded"
                  >
                    Upload LeetCode
                  </button>

                </div>

              </div>

              {/* STATUS */}

              <p className="text-sm text-gray-600">
                Status: {d.status}
              </p>

              {/* WEEKLY BLOG */}

              {d.day % 7 === 6 && (

                <div className="border-t pt-4">

                  <h4 className="font-semibold mb-2">
                    Weekly Medium Blog
                  </h4>

                  <input
                    type="text"
                    placeholder="Paste Medium blog link"
                    className="border p-2 rounded w-72"
                    onChange={(e) =>
                      setBlogLinks({
                        ...blogLinks,
                        [d.day]: e.target.value
                      })
                    }
                  />

                  <button
                    onClick={() => submitBlog(d.day)}
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