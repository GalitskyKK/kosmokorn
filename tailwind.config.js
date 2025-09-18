/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        cosmic: {
          50: "#f0f0ff",
          100: "#e6e6ff",
          200: "#d1d1ff",
          300: "#b3b3ff",
          400: "#8080ff",
          500: "#4d4dff",
          600: "#3333ff",
          700: "#1a1aff",
          800: "#0000cc",
          900: "#000099"
        },
        space: {
          50: "#f7f7ff",
          100: "#ebebff",
          200: "#d4d4ff",
          300: "#b8b8ff",
          400: "#9494ff",
          500: "#6b6bff",
          600: "#4747ff",
          700: "#2828ff",
          800: "#1f1f9e",
          900: "#1a1a7d"
        },
        dark: {
          50: "#16213e",
          100: "#1a1a2e",
          200: "#16213e",
          300: "#0f0f23",
          400: "#0a0a1a",
          500: "#050511",
          600: "#030308",
          700: "#020205",
          800: "#010103",
          900: "#000000"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
        glow: "glow 2s ease-in-out infinite alternate"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px rgb(79 70 229), 0 0 10px rgb(79 70 229), 0 0 15px rgb(79 70 229)"
          },
          "100%": {
            boxShadow: "0 0 10px rgb(79 70 229), 0 0 20px rgb(79 70 229), 0 0 30px rgb(79 70 229)"
          }
        }
      },
      backgroundImage: {
        "space-gradient": "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        "planet-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      screens: {
        xs: "375px",
        mobile: { max: "767px" },
        tablet: { min: "768px", max: "1023px" },
        desktop: { min: "1024px" }
      }
    }
  },
  plugins: []
}
