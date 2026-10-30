import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import NavBar from "@/components/NavBar";
import "./globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "תיאוריה — אתר לימוד לבחינה העיונית",
  description: "לומדים לבחינה העיונית לרישיון נהיגה ב׳ עם שאלות מהמאגר הרשמי של משרד התחבורה",
  // Add to Home Screen (Chrome/Safari on iOS) opens standalone under this name.
  appleWebApp: { capable: true, title: "תיאוריה", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1014" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The boot script below sets data-theme / data-returning on <html> before hydration.
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[var(--th-bg)] text-[var(--th-fg)] font-sans antialiased">
        {/* Before paint: apply the saved theme (no stored choice → leave the attribute
            unset so CSS follows the OS), and mark returning learners so the home hero
            renders its personalized variant without a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var d=document.documentElement,t=localStorage.getItem("theory-il:theme");if(t==="dark"||t==="light")d.dataset.theme=t;if(localStorage.getItem("theory-il:qstats")||localStorage.getItem("theory-il:lastDrill"))d.dataset.returning="1";}catch(e){}`,
          }}
        />
        <NavBar />
        {children}
      </body>
    </html>
  );
}
