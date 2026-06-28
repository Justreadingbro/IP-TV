/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        lux: {
          bg: '#040404',
          surface: '#0a0a0a',
          elevated: '#111111',
          border: '#1a1a1a',
          fg: '#f5f5f5',
          muted: '#666666',
          primary: '#3B82F6',
          'primary-glow': 'rgba(59, 130, 246, 0.15)',
          accent: '#8B5CF6',
          'accent-glow': 'rgba(139, 92, 246, 0.15)',
          green: '#22C55E',
          'green-glow': 'rgba(34, 197, 94, 0.2)',
          gold: '#FACC15',
          live: '#EF4444',
          'live-glow': 'rgba(239, 68, 68, 0.3)',
          glass: 'rgba(10, 10, 10, 0.75)',
        }
      },
      fontFamily: {
        display: ['Inter Display', 'SF Pro Display', 'Geist', 'system-ui', 'sans-serif'],
        body: ['Inter', 'SF Pro Text', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '24px',
        '5xl': '32px',
      },
      animation: {
        'aurora': 'aurora 20s ease-in-out infinite',
        'aurora-slow': 'aurora 30s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s ease-in-out infinite',
        'glow': 'glow-pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'drift': 'drift 12s ease-in-out infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '25%': { transform: 'translate(-20%, 15%) scale(1.05)', opacity: '0.35' },
          '50%': { transform: 'translate(15%, -10%) scale(0.95)', opacity: '0.3' },
          '75%': { transform: 'translate(-10%, 20%) scale(1.02)', opacity: '0.25' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-300% 0' },
          '100%': { backgroundPosition: '300% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px rgba(239, 68, 68, 0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 16px rgba(239, 68, 68, 0.5), 0 0 24px rgba(239, 68, 68, 0.2)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(10px, -15px) rotate(1deg)' },
          '66%': { transform: 'translate(-10px, 5px) rotate(-1deg)' },
        },
      },
      backdropBlur: {
        glass: '24px',
      },
      boxShadow: {
        'glow-primary': '0 0 30px rgba(59, 130, 246, 0.15)',
        'glow-accent': '0 0 30px rgba(139, 92, 246, 0.15)',
        'glow-live': '0 0 20px rgba(239, 68, 68, 0.3)',
        'elevated': '0 12px 48px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
