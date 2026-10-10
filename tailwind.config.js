/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1A1814',
          soft: '#2C2823',
          muted: '#6B6258',
        },
        cream: {
          DEFAULT: '#F7F3EE',
          dark: '#EFE9E1',
          light: '#FBF9F5',
        },
        stone: {
          DEFAULT: '#DDD5CA',
          light: '#E8E2D9',
          dark: '#C9BFB0',
        },
        clay: {
          DEFAULT: '#B85C43',
          light: '#D17862',
          dark: '#9A4A35',
          soft: '#E8C9BE',
        },
        gold: {
          DEFAULT: '#B89968',
          light: '#CBB07E',
          soft: '#E6D9C2',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      letterSpacing: {
        'widest-plus': '0.2em',
      },
    },
  },
  plugins: [],
};
