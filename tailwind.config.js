module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50:  '#FFF8F0',
          100: '#FEEDD6',
          200: '#FCD8A8',
          300: '#F9BB72',
          400: '#F5963C',
          500: '#E07B22',
          600: '#C96015',
          700: '#A84A0E',
          800: '#883A0C',
          900: '#6C2D0A',
        },
        lotus: {
          100: '#FCEEF5',
          300: '#EFA8CB',
          500: '#C2547A',
          700: '#8E2A52',
        },
        temple: {
          cream:   '#FFF9F0',
          ivory:   '#FFFDF7',
          parchment: '#F5E6CC',
          gold:    '#B8860B',
          'gold-light': '#D4AF37',
          brown:   '#2D1B00',
          'brown-mid': '#5C3D1E',
          'brown-light': '#9A6B45',
          border:  '#E0C080',
          'border-light': '#F0D8A8',
        },
        kumkum: '#C0392B',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        devanagari: ['"Noto Serif Devanagari"', 'serif'],
      },
      backgroundImage: {
        'lotus-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E07B22' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'temple-sm': '0 2px 8px rgba(180, 100, 0, 0.10)',
        'temple':    '0 4px 20px rgba(180, 100, 0, 0.15)',
        'temple-lg': '0 8px 40px rgba(180, 100, 0, 0.20)',
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.30)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
}
