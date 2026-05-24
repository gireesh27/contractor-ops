import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172019",
        field: "#f5f7f1",
        lime: "#9bc53d",
        brick: "#c75d3d",
        river: "#1f7a8c",
        steel: "#536878",
        saffron: "#f2a541",
        graphite: "#0b1120",
        "graphite-2": "#111827",
        blueprint: "#1d4ed8",
        "safety-yellow": "#facc15"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(23, 32, 25, 0.08)",
        glow: "0 24px 80px rgba(29, 78, 216, 0.22)",
        glass: "0 24px 70px rgba(2, 6, 23, 0.16)"
      },
      backgroundImage: {
        "premium-grid": "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)",
        "hero-radial": "radial-gradient(circle at 20% 20%, rgba(250,204,21,.22), transparent 30%), radial-gradient(circle at 80% 10%, rgba(37,99,235,.24), transparent 28%), linear-gradient(135deg, #020617 0%, #0b1120 45%, #111827 100%)"
      }
    }
  },
  plugins: []
};

export default config;
