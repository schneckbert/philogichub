/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surface colors (from CSS variables)
        surface: {
          0: 'var(--clr-surface-a0)',
          10: 'var(--clr-surface-a10)',
          20: 'var(--clr-surface-a20)',
          30: 'var(--clr-surface-a30)',
        },
        'surface-tonal': {
          0: 'var(--clr-surface-tonal-a0)',
          10: 'var(--clr-surface-tonal-a10)',
          20: 'var(--clr-surface-tonal-a20)',
          30: 'var(--clr-surface-tonal-a30)',
        },
        primary: {
          0: 'var(--clr-primary-a0)',
          10: 'var(--clr-primary-a10)',
          20: 'var(--clr-primary-a20)',
          30: 'var(--clr-primary-a30)',
        },
        success: {
          0: 'var(--clr-success-a0)',
          10: 'var(--clr-success-a10)',
          20: 'var(--clr-success-a20)',
        },
        warning: {
          0: 'var(--clr-warning-a0)',
          10: 'var(--clr-warning-a10)',
          20: 'var(--clr-warning-a20)',
        },
        danger: {
          0: 'var(--clr-danger-a0)',
          10: 'var(--clr-danger-a10)',
          20: 'var(--clr-danger-a20)',
        },
        info: {
          0: 'var(--clr-info-a0)',
          10: 'var(--clr-info-a10)',
          20: 'var(--clr-info-a20)',
        },
      },
      backgroundColor: {
        'app-root': 'var(--clr-surface-a0)',
      },
      borderColor: {
        'default': 'var(--clr-surface-a30)',
      },
    },
  },
  plugins: [],
};
