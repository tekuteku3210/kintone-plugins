/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx,js,jsx}',
    './plugin/html/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#dbeafe',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
      },
      borderRadius: {
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
      },
    },
  },
  plugins: [],
};
