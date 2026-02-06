/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "#E2E8F0",
        input: "#F1F5F9",
        ring: "#00B4D8",
        background: "#FFFFFF",
        foreground: "#0F172A",
        primary: {
          DEFAULT: "#00B4D8",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        surface: "#F8F9FA",
        "surface-highlight": "#F1F5F9",
        muted: {
          DEFAULT: "#94A3B8",
          foreground: "#64748B",
        },
        accent: {
          DEFAULT: "#F1F5F9",
          foreground: "#0F172A",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#FFFFFF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.3rem",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};