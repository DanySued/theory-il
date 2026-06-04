"use client";

import { useState } from "react";

export default function ExamStartScreen({
  onStart,
}: {
  onStart: (topic: string | null) => void;
}) {
  const [topic, setTopic] = useState<string>("all");

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-6">
      <div className="w-full max-w-md flex flex-col gap-6 rounded-[var(--th-radius)] border border-[var(--th-border)] bg-[var(--th-card)] p-8 text-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">מבחן מדומה</h1>
          <p className="text-[var(--th-muted)]">בחר נושא והתחל</p>
        </div>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded-lg border border-[var(--th-border)] bg-[var(--th-card)] px-3 py-2 text-sm"
        >
          <option value="all">כל הנושאים</option>
          <option value="חוקי התנועה">חוקי התנועה</option>
          <option value="תמרורים">תמרורים</option>
          <option value="בטיחות">בטיחות</option>
          <option value="הכרת הרכב">הכרת הרכב</option>
        </select>
        <button
          type="button"
          onClick={() => onStart(topic === "all" ? null : topic)}
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-[var(--th-accent)] text-white font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
        >
          התחל מבחן
        </button>
      </div>
    </main>
  );
}
