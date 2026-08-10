/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vum: {
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          accent: '#EFF6FF',
          border: '#E2E8F0',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          text: '#0F172A',
          muted: '#64748B',
        },
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#EFF6FF',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
