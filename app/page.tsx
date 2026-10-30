import Link from "next/link";
import StreakBadge from "@/components/StreakBadge";
import DailyChallengeTile from "@/components/DailyChallengeTile";
import ReturningHero from "@/components/ReturningHero";
import { HomeContinueCard, HomeStartCard } from "@/components/HomeToday";
import questionsData from "@/lib/data/questions.json";
import { TOPIC_COUNTS, TOTAL_QUESTIONS } from "@/lib/data/topics";

// Server-only: a compact id → topic map so the returning-user hero can estimate
// readiness without shipping the full corpus to the home page.
const TOPIC_KEYS = Object.keys(TOPIC_COUNTS);
const TOPIC_INDEX: Record<string, number> = Object.fromEntries(
  (questionsData as { id: string; topic: string }[]).map((q) => [q.id, TOPIC_KEYS.indexOf(q.topic)])
);

const TOPICS = [
  { key: "חוקי התנועה", desc: "זכות קדימה, מהירות, חנייה, אותות ועוד" },
  { key: "תמרורים", desc: "אזהרה, חובה, איסור, מידע וסימוני כביש" },
  { key: "בטיחות", desc: "בטיחות בנהיגה, בטיחות ילדים ומצבי חירום" },
  { key: "הכרת הרכב", desc: "מכניקה בסיסית, מד דלק, אורות ועוד" },
];

const SIGN_CATEGORIES = [
  { name: "אזהרה", color: "var(--th-cat-warning)", desc: "משולשים אדומים — מזהירים מפני סכנה קרובה" },
  { name: "חובה", color: "var(--th-cat-mandatory)", desc: "עיגולים כחולים — מחייבים פעולה מסוימת" },
  { name: "איסור", color: "var(--th-cat-prohibition)", desc: "עיגולים אדומים — אוסרים פעולה מסוימת" },
  { name: "מידע", color: "var(--th-cat-info)", desc: "מלבנים, לרוב כחולים או ירוקים — מספקים מידע לנהג" },
  { name: "סימוני כביש", color: "var(--th-cat-road)", desc: "סימונים על הכביש — קווים, חצים ורצועות" },
];

// Phones show `short ?? label` + `brief` (the iPhone design); desktop shows `label` + `desc`.
const STUDY_MODES: { label: string; short?: string; href: string; brief: string; desc: string }[] = [
  { label: "חזרה חכמה", href: "/review", brief: "20 שאלות שבחרנו לך", desc: "סבב של 20 שאלות שבחרנו עבורך לפי הנתונים שלך" },
  { label: "לימוד לפי נושא", short: "לפי נושא", href: "/study", brief: `${TOTAL_QUESTIONS.toLocaleString("en-US")} שאלות רשמיות`, desc: "קרא, ענה ולמד — שאלות מהמאגר הרשמי עם משוב מיידי" },
  { label: "מבחן תרגול", href: "/exam", brief: "30 שאלות · 40 דקות", desc: "30 שאלות אקראיות, ממשק דומה למבחן האמיתי" },
  { label: "כרטיסיות שינון", short: "כרטיסיות", href: "/flashcards", brief: "חזרה מרווחת", desc: "חזרה מרווחת (SRS) — הכרטיסים חוזרים בדיוק כשעומדים לשכוח אותם" },
];

const cardLink =
  "rounded-[var(--th-radius-lg)] bg-[var(--th-card)] border border-[var(--th-border)] hover:border-[var(--th-accent)] hover:shadow-md transition-all";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 sm:px-6">
      {/* Hero — first-time and returning variants are toggled by <html data-returning>
          (set before paint by the boot script in layout.tsx), so neither flashes.
          Phones: compact start-aligned hero with the continue/start card above the fold. */}
      <section className="th-hero w-full max-w-2xl flex flex-col items-stretch sm:items-center text-start sm:text-center gap-4 sm:gap-8 justify-center pt-5 sm:py-16">
        <div className="flex flex-col gap-1">
          <span className="sm:hidden text-xs font-semibold tracking-[0.08em] text-[var(--th-accent)]">
            הבחינה העיונית · רישיון ב׳
          </span>
          <h1 className="th-display th-hero-title text-[var(--th-fg)]">
            <span className="sm:block">מתכוננים</span>{" "}
            <span className="text-[var(--th-accent)]">לתיאוריה</span>
          </h1>
        </div>

        <div className="sm:hidden flex flex-col">
          <HomeStartCard />
          <HomeContinueCard topicIndex={TOPIC_INDEX} />
        </div>

        <div className="th-new-only hidden sm:flex flex-col items-center gap-8 w-full">
          <p className="text-lg text-[var(--th-muted-strong)] leading-relaxed max-w-md">
            הגעת למקום הנכון :)
            <br />
            לעבור תיאוריה זה לא כזה פשוט. אבל אנחנו פה בשבילך
          </p>
          <div className="flex flex-col items-center gap-4 w-full">
            <Link
              href="/study/תמרורים?view=drill"
              className="inline-flex items-center justify-center h-14 w-full max-w-xs rounded-[var(--th-radius-lg)] bg-[var(--th-accent)] text-[var(--th-on-accent)] text-base font-semibold shadow-sm hover:bg-[var(--th-accent-hover)] hover:shadow-md transition-all"
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
        </div>

        <div className="th-returning-only hidden sm:flex flex-col items-center gap-5 w-full">
          <StreakBadge />
          <ReturningHero topicIndex={TOPIC_INDEX} />
        </div>
      </section>

      {/* Daily challenge ("continue where you left off" lives in the returning hero) */}
      <section className="w-full max-w-3xl pt-4 sm:pt-10 flex flex-col gap-3">
        <DailyChallengeTile />
      </section>

      {/* Study modes */}
      <section className="w-full max-w-3xl pt-4 pb-8 sm:py-14 flex flex-col gap-2 sm:gap-6">
        <div className="flex flex-col gap-1 sm:mb-6">
          <h2 className="sm:hidden text-[15px] font-bold">דרכי לימוד</h2>
          <span className="th-eyebrow hidden sm:block">דרכי לימוד</span>
          <h2 className="th-section-h hidden sm:block">ארבע דרכים להתכונן</h2>
          <p className="text-sm text-[var(--th-muted-strong)] mt-1 hidden sm:block">
            כל שיטה מתאימה לשלב אחר — בחר את מה שמתאים לך עכשיו
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
          {STUDY_MODES.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`flex flex-col gap-0.5 sm:gap-2 min-h-[76px] px-3.5 py-3 sm:p-5 h-full ${cardLink}`}
            >
              <span className="text-[15px] sm:text-base font-bold text-[var(--th-fg)]">
                <span className="sm:hidden">{m.short ?? m.label}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </span>
              <span className="sm:hidden text-xs text-[var(--th-muted-strong)]">{m.brief}</span>
              <span className="hidden sm:block text-sm text-[var(--th-muted)] leading-relaxed">{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Topics */}
      <section className="w-full max-w-3xl py-8 sm:py-14 flex flex-col gap-4 sm:gap-6 border-t border-[var(--th-border)]">
        <div className="flex flex-col gap-1 mb-2">
          <span className="th-eyebrow">נושאי הלימוד</span>
          <h2 className="th-section-h">{TOTAL_QUESTIONS.toLocaleString("en-US")} שאלות מהמאגר הרשמי</h2>
          <p className="text-sm text-[var(--th-muted-strong)] mt-1">
            כל השאלות לקוחות מהמאגר הרשמי של משרד התחבורה לרישיון ב׳ — המאגר שממנו נבחרות שאלות המבחן
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {TOPICS.map((t) => (
            <Link
              key={t.key}
              href={`/study/${t.key}`}
              className={`flex items-center justify-between gap-4 p-4 ${cardLink}`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-[var(--th-fg)]">{t.key}</span>
                <span className="text-xs text-[var(--th-muted)]">{t.desc}</span>
              </div>
              <span className="shrink-0 font-mono text-sm font-semibold text-[var(--th-accent)] bg-[var(--th-accent-soft)] px-2.5 py-1 rounded-[var(--th-radius-sm)]">
                {TOPIC_COUNTS[t.key]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Signs catalog preview */}
      <section className="w-full max-w-3xl py-8 sm:py-14 flex flex-col gap-4 sm:gap-6 border-t border-[var(--th-border)]">
        <div className="flex flex-col gap-1 mb-2">
          <span className="th-eyebrow">מילון התמרורים</span>
          <h2 className="th-section-h">חמש קטגוריות של תמרורים</h2>
          <p className="text-sm text-[var(--th-muted-strong)] mt-1">
            ניתן לסמן כל תמרור שאתה מכיר ולעקוב אחר ההתקדמות
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {SIGN_CATEGORIES.map((cat) => (
            <Link key={cat.name} href="/study/תמרורים" className={`flex items-center gap-4 p-4 ${cardLink}`}>
              <span className="shrink-0 w-3 h-3 rounded-full" style={{ background: cat.color }} />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-bold text-[var(--th-fg)]">{cat.name}</span>
                <span className="text-xs text-[var(--th-muted)]">{cat.desc}</span>
              </div>
              <span className="text-[var(--th-muted)] text-sm shrink-0">←</span>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/study/תמרורים"
            className="inline-flex items-center gap-2 min-h-11 text-sm font-semibold text-[var(--th-accent)] hover:underline"
          >
            לכל מילון התמרורים
            <span aria-hidden>←</span>
          </Link>
        </div>
      </section>

      <div className="h-4 sm:h-16" />
    </main>
  );
}
