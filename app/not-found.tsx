import Link from "next/link";
import PageShell from "@/components/PageShell";

export default function NotFound() {
  return (
    <PageShell showBack={false}>
      <div className="flex flex-col items-center text-center gap-4 py-12">
        <span className="th-eyebrow">404</span>
        <h1 className="th-page-title">הדף לא נמצא</h1>
        <p className="th-body max-w-md">ייתכן שהקישור שגוי או שהדף הועבר. בוא נחזיר אותך ללימוד.</p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] text-sm font-semibold hover:bg-[var(--th-accent-hover)] transition-colors"
          >
            לדף הבית
          </Link>
          <Link
            href="/study"
            className="inline-flex items-center justify-center h-11 px-5 rounded-[var(--th-radius-lg)] border border-[var(--th-border)] text-sm font-semibold text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
          >
            לכל הנושאים
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
