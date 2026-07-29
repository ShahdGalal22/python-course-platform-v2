/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0D1117",
          soft: "#161B22",
          surface: "#1C2230",
          border: "#2A3244"
        },
        paper: {
          DEFAULT: "#F7F8FA",
          soft: "#FFFFFF",
          surface: "#EEF1F5",
          border: "#DDE3EC"
        },
        mint: {
          DEFAULT: "#4FD1B5",
          bright: "#5EEAD4",
          dim: "#2C9C87"
        },
        amber: {
          DEFAULT: "#FDBA74",
          bright: "#FBBF24"
        },
        ink900: "#0B0E14"
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"]
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(0,0,0,0.25)",
        glow: "0 0 0 1px rgba(79,209,181,0.35), 0 8px 30px -10px rgba(79,209,181,0.35)"
      },
      keyframes: {
        blink: { "0%, 49%": { opacity: 1 }, "50%, 100%": { opacity: 0 } },
        fadeUp: { from: { opacity: 0, transform: "translateY(12px)" }, to: { opacity: 1, transform: "translateY(0)" } }
      },
      animation: {
        blink: "blink 1s step-start infinite",
        fadeUp: "fadeUp 0.5s ease-out both"
      }
    }
  },
  plugins: []
};
