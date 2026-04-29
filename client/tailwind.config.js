/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  theme: {
    extend: {

      /* 🎨 Color System */
      colors: {
  background: "#F5EBDD",
  card: "#FFF8F0",

  primary: "#1E3A8A",
  primaryHover: "#1E40AF",
  accent: "#3B82F6",

  success: "#B9FBC0",
  warning: "#FFD6A5",
  danger: "#FFADAD",
  textDark: "#4A4A4A",
  muted: "#7D7D7D"
},

      /* 💎 Shadows */
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.08)",
        card: "0 8px 20px rgba(0,0,0,0.05)",
        glow: "0 0 15px rgba(167, 139, 250, 0.4)"
      },

      /* 🔵 Border Radius */
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem"
      },

      /* 🌈 Gradient Background */
      backgroundImage: {
        pastelGradient:
          "linear-gradient(135deg, #F5EBDD 0%, #FFF8F0 100%)"
      },

      /* ✨ Animations */
      animation: {
        fadeIn: "fadeIn 0.6s ease-in-out",
        float: "float 3s ease-in-out infinite",
        pulseSoft: "pulseSoft 2s infinite"
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },

        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },

        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        }
      },

      /* 🖋 Font Family */
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
        display: ["Outfit", "sans-serif"]
      }
    }
  },
  darkMode: "class",
  darkBackground: "#1E1E2E",
  darkCard: "#2A2A3C",
  darkText: "#EAEAEA",
  plugins: []
  
};