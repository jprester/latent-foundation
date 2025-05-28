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
        // Light theme colors (refined)
        "scp-bg": "#f8fafc",
        "scp-text": "#1e293b",
        "scp-card": "#ffffff",
        "scp-border": "#e2e8f0",

        // Dark theme colors (much darker)
        "scp-bg-dark": "#0a0e16", // Much darker background - almost black with blue tint
        "scp-text-dark": "#f1f5f9", // Clean white text
        "scp-card-dark": "#151b26", // Dark cards but lighter than background
        "scp-border-dark": "#1e293b", // Subtle borders that barely show

        // Accent colors
        "scp-accent": "#dc2626",
        "scp-accent-dark": "#ef4444",

        // Class colors (refined)
        "scp-safe": "#059669",
        "scp-safe-dark": "#10b981",
        "scp-euclid": "#d97706",
        "scp-euclid-dark": "#f59e0b",
        "scp-keter": "#dc2626",
        "scp-keter-dark": "#ef4444",

        // Additional semantic colors
        "scp-muted": "#64748b",
        "scp-muted-dark": "#94a3b8",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
