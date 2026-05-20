import React from "react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function PointsCard({ title, value }) {

  const isNumber = typeof value === "number";
  const [displayValue, setDisplayValue] = useState(isNumber ? 0 : value);

  useEffect(() => {

    if (!isNumber) {
      setDisplayValue(value || "N/A");
      return;
    }

    // if (value > displayValue) {
    //   confetti({
    //     particleCount: 60,
    //     spread: 70,
    //     colors: ["#C8B6FF", "#A78BFA", "#FFD6A5"]
    //   });
    // }

    let start = 0;

    const interval = setInterval(() => {

      start += Math.ceil(value / 20);

      if (start >= value) {
        start = value;
        clearInterval(interval);
      }

      setDisplayValue(start);

    }, 30);

    return () => clearInterval(interval);

  }, [value]);

  return (
    <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition">
      <h4 className="text-textDark mb-2">{title}</h4>
      <p className="text-3xl font-bold text-accent">{displayValue}</p>
    </div>
  );
}