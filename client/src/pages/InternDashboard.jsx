import React from "react";
import { useEffect, useState } from "react";
import API from "../api/api";
import InternLayout from "../layouts/InternLayout";
import ActivityGrid from "../components/intern/ActivityGrid";
import PointsCard from "../components/intern/PointsCard";
import MCQSection from "../components/intern/MCQSection";
import UploadBox from "../components/intern/UploadBox";
import { useNavigate } from "react-router-dom";


export default function InternDashboard() {
  const [data, setData] = useState(null);

  // const fetchDashboard = async () => {
  //   const res = await API.get("/intern/dashboard");
  //   setData(res.data);
  // };

  // const navigate = useNavigate();

  const navigate = useNavigate();

const fetchDashboard = async () => {

  const res = await API.get("/intern/dashboard");

  if (!res.data.profile_complete) {
    navigate("/setup-profile");
    return;
  }

  setData(res.data);
};

  useEffect(() => {
  const fetchDashboard = async () => {
    const res = await API.get("/intern/dashboard");

    if (!res.data.profile_complete) {
      navigate("/setup-profile");
      return;
    }

    setData(res.data);
  };

  fetchDashboard();
}, []);

  if (!data) return <p>Loading...</p>;

  return (
    <InternLayout>

      <h2 className="text-3xl text-accent mb-6">
        Welcome {data.profile.name}
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <PointsCard title="Points" value={data?.profile?.total_points ?? 0} />
<PointsCard title="Domain" value={data?.profile?.domain ?? "Not selected"} />
<PointsCard title="Blogs" value={data?.blog_count ?? 0} />
      </div>

      <ActivityGrid activity={data.activity_grid} />

      <MCQSection 
        activity={data.activity_grid}
        refreshDashboard={fetchDashboard}
      />

      <UploadBox 
        activity={data.activity_grid}
        refreshDashboard={fetchDashboard}
      />

    </InternLayout>
  );
}