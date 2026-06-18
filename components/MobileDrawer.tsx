"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

interface Props {
  links: { href: string; label: string }[];
}

export default function MobileDrawer({ links }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="תפריט"
        aria-expanded={open}
        className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-[var(--th-radius-sm)] text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
      >
        <Menu size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm sm:hidden"
            />
            <motion.nav
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
              dir="rtl"
              className="fixed inset-y-0 end-0 z-50 w-72 max-w-[80vw] bg-[var(--th-bg)] border-s border-[var(--th-border)] shadow-lg flex flex-col sm:hidden"
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              <div className="flex items-center justify-between h-[61px] px-4 border-b border-[var(--th-border)]">
                <span className="text-lg font-extrabold tracking-tight">תפריט</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="סגור תפריט"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[var(--th-radius-sm)] text-[var(--th-muted)] hover:text-[var(--th-fg)] hover:bg-[var(--th-muted-bg)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="flex flex-col p-3 gap-1 overflow-y-auto">
                {links.map((l) => {
                  const active =
                    pathname === l.href || pathname.startsWith(l.href + "/");
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center min-h-11 px-4 rounded-[var(--th-radius-lg)] text-base transition-colors ${
                        active
                          ? "bg-[var(--th-accent-soft)] text-[var(--th-accent)] font-bold"
                          : "text-[var(--th-fg-soft)] font-medium hover:bg-[var(--th-muted-bg)]"
                      }`}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
