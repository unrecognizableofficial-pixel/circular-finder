import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        lg: "1.75rem",
        xl: "2rem"
      }
    },
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "1728px"
    },
    extend: {
      colors: {
        forest: {
          50: "#eff7f1",
          100: "#d8ebdc",
          200: "#b4d7bb",
          300: "#8fc297",
          400: "#62a56f",
          500: "#428452",
          600: "#2f6840",
          700: "#245233",
          800: "#1f432b",
          900: "#183724",
          950: "#0b1d12"
        },
        sand: {
          50: "#fcfbf7",
          100: "#f6f2e9",
          200: "#ece3d1",
          300: "#decdb0",
          400: "#cfb286",
          500: "#c29c68",
          600: "#ab7d4d",
          700: "#8f633f",
          800: "#734f37",
          900: "#60432f"
        },
        sage: {
          50: "#f2f6f2",
          100: "#e2ebdf",
          200: "#c7d7c4",
          300: "#a6bda2",
          400: "#84a182",
          500: "#688469",
          600: "#516754",
          700: "#425345",
          800: "#37443a",
          900: "#2f3931"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(18, 27, 20, 0.08)",
        shell: "0 20px 60px rgba(12, 22, 14, 0.12)"
      },
      borderRadius: {
        shell: "2rem"
      },
      gridTemplateColumns: {
        analytics: "minmax(0,1.2fr) minmax(0,0.8fr)",
        dashboard: "repeat(12, minmax(0, 1fr))"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
};

export default config;
