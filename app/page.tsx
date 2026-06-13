"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import StreakBadge from "@/components/StreakBadge";

// Real topic data — counts from questions.json
const TOPICS = [
  { key: "חוקי התנועה", count: 501, href: "/study/חוקי התנועה", desc: "זכות קדימה, מהירות, חנייה, אותות ועוד" },
  { key: "תמרורים", count: 361, href: "/study/תמרורים", desc: "אזהרה, חובה, איסור, מידע וסימוני כביש" },
  { key: "בטיחות", count: 305, href: "/study/בטיחות", desc: "בטיחות בנהיגה, בטיחות ילדים ומצבי חירום" },
  { key: "הכרת הרכב", count: 106, href: "/study/הכרת הרכב", desc: "מכניקה בסיסית, מד דלק, אורות ועוד" },
];

const SIGN_CATEGORIES = [
  { name: "אזהרה", color: "#f59e0b", desc: "משולשים אדומים — מזהירים מפני סכנה קרובה" },
  { name: "חובה", color: "#3b82f6", desc: "עיגולים כחולים — מחייבים פעולה מסוימת" },
  { name: "איסור", color: "#ef4444", desc: "עיגולים אדומים — אוסרים פעולה מסוימת" },
  { name: "מידע", color: "#22c55e", desc: "מלבנים ירוקים — מספקים מידע לנהג" },
  { name: "סימוני כביש", color: "#94a3b8", desc: "סימונים על הכביש — קווים, חצים ורצועות" },
];

const STUDY_MODES = [
  { label: "לימוד לפי נושא", href: "/study", desc: "קרא, ענה ולמד — שאלות מהמאגר הרשמי עם הסבר מיידי" },
  { label: "מבחן תרגול", href: "/exam", desc: "30 שאלות אקראיות, ממשק דומה למבחן האמיתי" },
  { label: "כרטיסיות שינון", href: "/flashcards", desc: "חזרה מהירה בשיטת SRS — מתאים לשנות מועד" },
];

function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.45s ease ${delay}ms, transform 0.45s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-6">
      {/* Hero */}
      <section className="w-full max-w-2xl flex flex-col items-center text-center gap-8 min-h-[calc(100dvh-61px)] justify-center py-16">
        <h1 className="th-display text-[var(--th-fg)]">
          מתכוננים
          <br />
          <span className="text-[var(--th-accent)]">לתיאוריה</span>
        </h1>

        <p className="text-lg text-[var(--th-muted-strong)] leading-relaxed max-w-md">
          הגעת למקום הנכון :)
          <br />
          לעבור תיאוריה זה לא כזה פשוט. אבל אנחנו פה בשבילך
        </p>

        <StreakBadge />

        <div className="flex flex-col items-center gap-4 w-full">
          <Link
            href="/study/תמרורים"
            className="inline-flex items-center justify-center h-14 w-full max-w-xs rounded-xl bg-[var(--th-accent)] text-white text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
          >
            בוא נתחיל בתמרורים?
            <span aria-hidden className="ms-2">←</span>
          </Link>
          <Link
            href="/study"
            className="text-sm text-[var(--th-muted)] underline underline-offset-4 hover:text-[var(--th-fg)] transition-colors"
          >
            רוצה להתחיל בנושא אחר?
          </Link>
        </div>
      </section>

      {/* Study modes */}
      <section className="w-full max-w-3xl py-14 flex flex-col gap-6">
        <FadeSection>
          <div className="flex flex-col gap-1 mb-6">
            <span className="th-eyebrow">דרכי לימוד</span>
            <h2 className="text-2xl font-bold text-[var(--th-fg)]">שלוש דרכים להתכונן</h2>
            <p className="text-sm text-[var(--th-muted-strong)] mt-1">
              כל שיטה מתאימה לשלב אחר — בחר את מה שמתאים לך עכשיו
            </p>
          </div>
        </FadeSection>
        <div className="grid sm:grid-cols-3 gap-4">
          {STUDY_MODES.map((m, i) => (
            <FadeSection key={m.href} delay={i * 60}>
              <Link
                href={m.href}
                className="flex flex-col gap-2 p-5 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-md transition-all h-full"
              >
                <span className="font-bold text-[var(--th-fg)]">{m.label}</span>
                <span className="text-sm text-[var(--th-muted)] leading-relaxed">{m.desc}</span>
              </Link>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="w-full max-w-3xl py-14 flex flex-col gap-6 border-t border-[var(--th-border)]">
        <FadeSection>
          <div className="flex flex-col gap-1 mb-2">
            <span className="th-eyebrow">נושאי הלימוד</span>
            <h2 className="text-2xl font-bold text-[var(--th-fg)]">1,273 שאלות מהמאגר הרשמי</h2>
            <p className="text-sm text-[var(--th-muted-strong)] mt-1">
              כל השאלות לקוחות ממאגר משרד התחבורה — אותן שאלות שיופיעו במבחן
            </p>
          </div>
        </FadeSection>
        <div className="grid sm:grid-cols-2 gap-4">
          {TOPICS.map((t, i) => (
            <FadeSection key={t.key} delay={i * 70}>
              <Link
                href={t.href}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-md transition-all"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-[var(--th-fg)]">{t.key}</span>
                  <span className="text-xs text-[var(--th-muted)]">{t.desc}</span>
                </div>
                <span className="shrink-0 font-mono text-sm font-semibold text-[var(--th-accent)] bg-[var(--th-accent-soft)] px-2.5 py-1 rounded-lg">
                  {t.count}
                </span>
              </Link>
            </FadeSection>
          ))}
        </div>
      </section>

      {/* Signs catalog preview */}
      <section className="w-full max-w-3xl py-14 flex flex-col gap-6 border-t border-[var(--th-border)]">
        <FadeSection>
          <div className="flex flex-col gap-1 mb-2">
            <span className="th-eyebrow">מילון התמרורים</span>
            <h2 className="text-2xl font-bold text-[var(--th-fg)]">חמש קטגוריות של תמרורים</h2>
            <p className="text-sm text-[var(--th-muted-strong)] mt-1">
              ניתן לסמן כל תמרור שאתה מכיר ולעקוב אחר ההתקדמות
            </p>
          </div>
        </FadeSection>
        <div className="flex flex-col gap-3">
          {SIGN_CATEGORIES.map((cat, i) => (
            <FadeSection key={cat.name} delay={i * 55}>
              <Link
                href="/study/תמרורים"
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-md transition-all"
              >
                <span
                  className="shrink-0 w-3 h-3 rounded-full"
                  style={{ background: cat.color }}
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-bold text-[var(--th-fg)]">{cat.name}</span>
                  <span className="text-xs text-[var(--th-muted)]">{cat.desc}</span>
                </div>
                <span className="text-[var(--th-muted)] text-sm shrink-0">←</span>
              </Link>
            </FadeSection>
          ))}
        </div>
        <FadeSection delay={300}>
          <div className="text-center">
            <Link
              href="/study/תמרורים"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--th-accent)] hover:underline"
            >
              לכל מילון התמרורים
              <span aria-hidden>←</span>
            </Link>
          </div>
        </FadeSection>
      </section>

      {/* Spacer */}
      <div className="h-16" />
    </main>
  );
}
