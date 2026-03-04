import React from "react";
export default function ActivityGrid({ activity }) {

  const getColor = (status) => {
    switch (status) {
      case "mcq_done":
        return "bg-[#D9C2FF]";
      case "full_complete":
        return "bg-[#A78BFA]";
      default:
        return "bg-gray-200";
    }
  };

  const getLabel = (status) => {
    switch (status) {
      case "mcq_done":
        return "MCQ Completed";
      case "full_complete":
        return "Full Completion";
      default:
        return "No Activity";
    }
  };

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md mt-8">
      <h3 className="text-xl text-accent mb-4">21-Day Progress </h3>

      <div className="grid grid-cols-7 gap-3 mb-6">
        {activity.map((item) => (
          <div
            key={item.day}
            title={getLabel(item.status)}
            className={`h-12 rounded-lg flex items-center justify-center text-sm font-semibold text-white cursor-pointer transition hover:scale-105 ${getColor(item.status)}`}
          >
            {item.day}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <span>No Activity</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#D9C2FF] rounded"></div>
          <span>MCQ Done</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-[#A78BFA] rounded"></div>
          <span>Full Complete</span>
        </div>
      </div>
    </div>
  );
}