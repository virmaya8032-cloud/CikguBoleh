import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep teal "ink" primary — classroom chalkboard, calm and capable
        teal: {
          50: "#eef7f5",
          100: "#d3ebe7",
          200: "#a8d7cf",
          300: "#74bcb1",
          400: "#469b8f",
          500: "#2b8073",
          600: "#0d7c74",
          700: "#0b5f59",
          800: "#0c4b47",
          900: "#0e3e3b",
          950: "#052421",
        },
        // Marigold accent — warm Malaysian classroom energy
        marigold: {
          50: "#fff7ed",
          100: "#ffedd3",
          200: "#ffd7a6",
          300: "#ffbb6e",
          400: "#ff9636",
          500: "#f97a12",
          600: "#e05e0a",
          700: "#b9450c",
          800: "#933811",
          900: "#772f11",
        },
        ink: "#12211f",
        cloud: "#f6f9f8",
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(6,30,28,0.04), 0 12px 32px -16px rgba(6,30,28,0.22)",
        lift: "0 2px 6px rgba(6,30,28,0.06), 0 28px 56px -24px rgba(6,30,28,0.34)",
        glass: "0 10px 34px -14px rgba(6,30,28,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
        glow: "0 0 0 1px rgba(13,124,116,0.28), 0 20px 44px -22px rgba(13,124,116,0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
