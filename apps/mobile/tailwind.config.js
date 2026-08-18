/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1a1a2e",
          50: "#f5f5f7",
          100: "#eaeaee",
          200: "#d5d5dd",
          300: "#b0b0c0",
          400: "#8585a0",
          500: "#6b6b8a",
          600: "#555575",
          700: "#3d3d5c",
          800: "#2a2a44",
          900: "#1a1a2e",
          950: "#0f0f1a",
        },
        accent: {
          DEFAULT: "#d4a574",
          50: "#fdf8f3",
          100: "#f9efdd",
          200: "#f2ddb8",
          300: "#e8c48a",
          400: "#d4a574",
          500: "#c49460",
          600: "#a67c4e",
          700: "#8a6542",
          800: "#6e5238",
          900: "#52432e",
        },
        surface: {
          DEFAULT: "rgba(255,255,255,0.08)",
          light: "rgba(255,255,255,0.12)",
          dark: "rgba(0,0,0,0.2)",
        },
        success: "#4a9d6e",
        warning: "#d4a574",
        error: "#c45c5c",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      fontFamily: {
        sans: ["System", "SF Pro Text", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
