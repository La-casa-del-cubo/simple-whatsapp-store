module.exports = {
    darkMode: 'media',
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: 'rgb(var(--color-primary-rgb))',
          secondary: 'rgb(var(--color-secondary-rgb))',
          'accent-orange': 'var(--color-accent-orange)',
          'accent-violet': 'var(--color-accent-violet)',
          'accent-yellow': 'var(--color-accent-yellow)',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
          'background': 'var(--color-background)',
          'surface': 'var(--color-surface)',
        },
        backgroundColor: {
          primary: 'rgb(var(--color-primary-rgb))',
          secondary: 'rgb(var(--color-secondary-rgb))',
          background: 'var(--color-background)',
          surface: 'var(--color-surface)',
        },
        textColor: {
          primary: 'rgb(var(--color-primary-rgb))',
          secondary: 'rgb(var(--color-secondary-rgb))',
          'text-primary': 'var(--color-text-primary)',
          'text-secondary': 'var(--color-text-secondary)',
        },
        borderColor: {
          primary: 'rgb(var(--color-primary-rgb))',
          secondary: 'rgb(var(--color-secondary-rgb))',
        },
      },
    },
    plugins: [],
  }
  