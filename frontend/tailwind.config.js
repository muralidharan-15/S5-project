/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#eff4ff',
        'surface-container': '#e5eeff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3f4850',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#707881',
        'outline-variant': '#bfc7d2',
        primary: '#006194',
        'on-primary': '#ffffff',
        'primary-container': '#007bb9',
        'on-primary-container': '#fdfcff',
        secondary: '#00687a',
        'on-secondary': '#ffffff',
        'secondary-container': '#57dffe',
        'on-secondary-container': '#006172',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        danger: '#DC2626',
        warning: '#EA580C',
        safe: '#10B981',
      },
      borderRadius: {
        card: '24px',
      },
      spacing: {
        'container-padding-mobile': '1.25rem',
        'container-padding-desktop': '2.5rem',
        'stack-sm': '0.5rem',
        'stack-md': '1rem',
        'stack-lg': '2rem',
        gutter: '1rem',
      },
      boxShadow: {
        card: '0 4px 24px rgba(15, 23, 42, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
