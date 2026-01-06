/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // COLORES ORIGINALES (de archivos HTML)
        "primary": "#ee2b8c",
        "primary-dark": "#d11a75",
        "background-light": "#f8f6f7",
        "background-dark": "#181114",  // desboar.html usa este
        "surface-dark": "#271c21",
        "surface-light": "#ffffff",
        "surface": "#392830",          // login.html usa este
        "text-secondary": "#b99dab",
        "text-muted": "#b99dab",       // login.html usa este nombre

        // COLORES NEÓN (COMENTADOS - Para activar en el futuro)
        // "primary": "#00E5FF",        // Neon Cyan/Blue
        // "primary-dark": "#00B8D4",   // Darker Cyan
        // "secondary": "#FF00FF",      // Neon Magenta/Pink
        // "accent": "#00FF00",         // Neon Green
        // "background-light": "#F0F4F8", // Very light blue-gray tint
        // "background-dark": "#050505",  // Almost pure black for neon contrast
        // "surface-dark": "#121212",     // Very dark gray surface
        // "surface-highlight": "#1a1a1a",
        // "text-secondary": "#94A3B8",   // Cool gray
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"],
        "body": ["Noto Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 229, 255, 0.5)',
        'neon-pink': '0 0 10px rgba(255, 0, 255, 0.5)',
        'neon-green': '0 0 10px rgba(0, 255, 0, 0.5)',
      },
      // GRADIENTES NEÓN (COMENTADOS - Para activar en el futuro)
      // backgroundImage: {
      //   'gradient-neon': 'linear-gradient(90deg, #00E5FF 0%, #7B2FBE 50%, #FF00FF 100%)',
      //   'gradient-neon-reverse': 'linear-gradient(90deg, #FF00FF 0%, #7B2FBE 50%, #00E5FF 100%)',
      //   'gradient-neon-text': 'linear-gradient(90deg, #00E5FF 20%, #7B2FBE 50%, #FF00FF 80%)',
      //   'gradient-cyan-purple': 'linear-gradient(90deg, #00E5FF 0%, #7B2FBE 100%)',
      //   'gradient-purple-pink': 'linear-gradient(90deg, #7B2FBE 0%, #FF00FF 100%)',
      //   'gradient-neon-radial': 'radial-gradient(circle, #00E5FF 0%, #7B2FBE 50%, #FF00FF 100%)',
      //   'gradient-neon-diagonal': 'linear-gradient(135deg, #00E5FF 0%, #7B2FBE 50%, #FF00FF 100%)',
      // },
      animation: {
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.2s ease-out"
      },
      keyframes: {
        slideUp: {
          '100%': { transform: 'translateY(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
