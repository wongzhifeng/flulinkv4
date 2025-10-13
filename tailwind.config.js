/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // FluLink v4.0 色彩系统
        primary: {
          bg: '#0a0a1a',
          secondary: '#1a1a2e',
          card: '#16213e',
        },
        text: {
          primary: '#eaeaea',
          secondary: '#a8a8a8',
        },
        accent: {
          gold: '#ffd700',
          red: '#e94560',
          purple: '#533483',
          cyan: '#00adb5',
        },
        neumorphism: {
          light: 'rgba(255, 255, 255, 0.05)',
          dark: 'rgba(0, 0, 0, 0.2)',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      boxShadow: {
        'neumorphism': '8px 8px 16px rgba(0, 0, 0, 0.3), -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neumorphism-inset': 'inset 8px 8px 16px rgba(0, 0, 0, 0.3), inset -8px -8px 16px rgba(255, 255, 255, 0.05)',
        'neumorphism-hover': '12px 12px 20px rgba(0, 0, 0, 0.4), -12px -12px 20px rgba(255, 255, 255, 0.07)',
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #ffd700, #ffaa00)',
        'gradient-virus': 'linear-gradient(90deg, rgba(233, 69, 96, 0.8) 0%, rgba(83, 52, 131, 0.6) 50%, rgba(0, 173, 181, 0.4) 100%)',
        'gradient-card': 'linear-gradient(145deg, #1e2a45, #0d1b2a)',
        'gradient-card-inset': 'linear-gradient(145deg, #0d1b2a, #1e2a45)',
      },
      animation: {
        'virus-pulse': 'virusPulse 3s infinite',
        'gradient-shift': 'gradientShift 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        virusPulse: {
          '0%': { left: '-30%' },
          '100%': { left: '100%' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backdropBlur: {
        'glass': '10px',
      },
    },
  },
  plugins: [],
}
