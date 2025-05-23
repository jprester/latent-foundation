import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "scp-bg": "#f4f4f4",
        "scp-text": "#333333",
        "scp-accent": "#901010",
        "scp-safe": "#14532d",
        "scp-euclid": "#ea580c",
        "scp-keter": "#991b1b",
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
