import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[var(--th-bg)] text-[var(--th-fg)] font-sans antialiased">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
