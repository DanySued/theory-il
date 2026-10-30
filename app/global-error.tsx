"use client"; // Replaces the root layout when it fails, so it brings its own <html>/<body>.

import "./globals.css";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-dvh flex items-center justify-center bg-[var(--th-bg)] text-[var(--th-fg)] font-sans px-6">
        <title>שגיאה — תיאוריה</title>
        <div className="flex flex-col items-center text-center gap-4 max-w-md">
          <h1 className="th-page-title">משהו השתבש</h1>
          <p className="th-body">ההתקדמות שלך שמורה בדפדפן. נסה לטעון את האתר שוב.</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] text-sm font-semibold"
            >
              נסה שוב
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full reload is the point here */}
            <a
              href="/"
              className="inline-flex items-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-semibold"
            >
              לדף הבית
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
