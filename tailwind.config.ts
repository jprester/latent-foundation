import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "scp-bg": "#f4f4f4",
        "scp-bg-dark": "#1a1a1a",
        "scp-text": "#333333",
        "scp-text-dark": "#e5e5e5",
        "scp-accent": "#901010",
        "scp-accent-dark": "#cc1414",
        "scp-safe": "#14532d",
        "scp-safe-dark": "#22c55e",
        "scp-euclid": "#ea580c",
        "scp-euclid-dark": "#fb923c",
        "scp-keter": "#991b1b",
        "scp-keter-dark": "#ef4444",
        "scp-card": "#ffffff",
        "scp-card-dark": "#2d2d2d",
        "scp-border": "#d1d5db",
        "scp-border-dark": "#404040",
      },
      fontFamily: {
        mono: ["Courier New", "monospace"],
        sans: ["Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
