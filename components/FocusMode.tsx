"use client";

import { useEffect } from "react";

/**
 * Marks the current screen as a focus screen (drill, running exam, flashcard deck):
 * on phones the global header and the bottom tab bar step aside for FocusHeader and
 * FocusActionBar. The marker span lets CSS (`:has`) apply it from the server HTML, so
 * nothing flashes on load; the data attribute is the same signal for scripts.
 */
export default function FocusMode() {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.focus = "1";
    return () => {
      delete root.dataset.focus;
    };
  }, []);

  return <span className="th-focus-marker" hidden />;
}
