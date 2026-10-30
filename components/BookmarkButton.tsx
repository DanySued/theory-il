"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getBookmarks, toggleBookmark } from "@/lib/storage";

const EVENT = "theory-il:bookmarks";

/**
 * Save/unsave a question. Several instances can show the same question (the phone
 * FocusHeader and the desktop card row), so a toggle broadcasts and every copy re-reads.
 */
export default function BookmarkButton({
  questionId,
  className,
  size = 16,
}: {
  questionId: string;
  className: (saved: boolean) => string;
  size?: number;
}) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(getBookmarks().has(questionId));
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, [questionId]);

  const label = saved ? "הסר מהשמורות" : "שמור שאלה";
  return (
    <button
      type="button"
      onClick={() => {
        toggleBookmark(questionId);
        window.dispatchEvent(new Event(EVENT));
      }}
      aria-label={label}
      aria-pressed={saved}
      title={label}
      className={className(saved)}
    >
      <Star size={size} aria-hidden fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
