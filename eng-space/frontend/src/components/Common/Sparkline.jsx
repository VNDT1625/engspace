import React from "react";

const Sparkline = ({ points }) => {
  if (!points || points.length === 0) {
    return <div className="admin-sparkline empty"></div>;
  }
  const max = Math.max(...points);
  const min = Math.min(...points);
  const denom = max - min || 1;
  const normalized = points.map((p, idx) => {
    const x = (idx / Math.max(points.length - 1, 1)) * 100;
    const y = 100 - ((p - min) / denom) * 100;
    return `${x},${y}`;
  });
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="admin-sparkline">
      <polyline points={normalized.join(" ")} />
    </svg>
  );
};

export default Sparkline;