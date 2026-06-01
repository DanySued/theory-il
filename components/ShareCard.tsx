"use client";

import { forwardRef } from "react";

interface ShareCardProps {
  correct: number;
  passed: boolean;
  duration: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ correct, passed, duration }, ref) => {
    const scoreColor = passed ? "#4ade80" : "#f87171";

    return (
      <div
        ref={ref}
        style={{
          width: 600,
          height: 340,
          background: "#1a1a1a",
          borderRadius: 16,
          padding: "40px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Heebo, Arial, sans-serif",
          direction: "rtl",
          color: "#f0eeea",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 14, color: "#6b7280", letterSpacing: "0.02em" }}>
          תיאוריה — מבחן מדומה לרישיון נהיגה
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 88,
              fontWeight: 800,
              color: scoreColor,
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            {correct}/30
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: scoreColor }}>
            {passed ? "עברתי! ✓" : "לא עברתי ✗"}
          </div>
          <div style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
            זמן: {duration} · ציון מעבר: 26/30
          </div>
        </div>

        <div style={{ fontSize: 12, color: "#4b5563" }}>theory-il.vercel.app</div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
export default ShareCard;
