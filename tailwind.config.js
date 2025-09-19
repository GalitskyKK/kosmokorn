/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Новая, более мягкая и красочная палитра
        brand: {
          primary: "#8E44AD", // Яркий фиолетовый
          secondary: "#3498DB", // Спокойный синий
          accent: "#F1C40F", // Теплый желтый
          light: "#ECF0F1" // Очень светлый серый (почти белый)
        },
        dark: {
          900: "#1C1B22", // Глубокий, слегка фиолетовый черный
          800: "#2C2A33", // Очень темный серый
          700: "#3E3B45", // Темно-серый
          600: "#5A5661", // Средне-серый
          500: "#7E7987" // Светло-серый
        },
        // Старые палитры можно оставить для обратной совместимости или удалить
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
        }
      },
      fontFamily: {
        sans: ["'Nunito Sans'", "system-ui", "sans-serif"], // Более мягкий, округлый шрифт
        mono: ["'Fira Code'", "monospace"]
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
          "50%": { transform: "translateY(-10px)" } // Уменьшил амплитуду
        },
        glow: {
          "0%": {
            boxShadow: "0 0 5px #8E44AD, 0 0 10px #8E44AD, 0 0 15px #8E44AD"
          },
          "100%": {
            boxShadow: "0 0 10px #3498DB, 0 0 20px #3498DB, 0 0 30px #3498DB"
          }
        }
      },
      backgroundImage: {
        "space-gradient":
          "radial-gradient(ellipse at bottom, #1C1B22 0%, #3E3B45 50%, #2C2A33 100%)" // Новый градиент
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
