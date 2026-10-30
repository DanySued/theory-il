import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "תיאוריה — לימוד לבחינה העיונית",
    short_name: "תיאוריה",
    description: "לומדים לבחינה העיונית לרישיון נהיגה ב׳ עם שאלות מהמאגר הרשמי של משרד התחבורה",
    dir: "rtl",
    lang: "he",
    display: "standalone",
    start_url: "/",
    background_color: "#f6f4ee",
    theme_color: "#1d4ed8",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
    ],
  };
}
