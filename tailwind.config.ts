import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1A365D',
          50: '#EBF0F8',
          100: '#C8D7EE',
          200: '#92AFDE',
          300: '#5C87CE',
          400: '#3669B8',
          500: '#1A365D',
          600: '#152C4E',
          700: '#10213C',
          800: '#0B1729',
          900: '#050C16',
        },
        teal: {
          DEFAULT: '#2A9D8F',
          50: '#E8F7F5',
          100: '#BDEAE4',
          200: '#7DD4CB',
          300: '#4BBFB3',
          400: '#2A9D8F',
          500: '#228178',
          600: '#1A6560',
          700: '#134947',
          800: '#0D302F',
          900: '#061817',
        },
        amber: {
          DEFAULT: '#E07E26',
          50: '#FEF5EC',
          100: '#FCE2C4',
          200: '#F9C489',
          300: '#F5A64E',
          400: '#E07E26',
          500: '#C4661C',
          600: '#9A5016',
          700: '#703A10',
          800: '#472509',
          900: '#1E0F03',
        },
        slate: '#1E293B',
        offwhite: '#F8FAFB',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #EBF0F8 0%, #F8FAFB 60%, #E8F7F5 100%)',
      },
      boxShadow: {
        soft: '0 2px 8px rgba(26, 54, 93, 0.08)',
        card: '0 4px 16px rgba(26, 54, 93, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
