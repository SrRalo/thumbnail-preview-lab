/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        yt: ['Roboto', 'Arial', 'sans-serif'],
      },
      colors: {
        yt: {
          red: '#ff0000',
          light: '#ffffff',
          dark: '#0f0f0f',
        },
      },
    },
  },
  plugins: [],
};
