/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: '#0EA5E9', // sky-blue
          hover: '#0284C7',
          active: '#0369A1',
        },
        secondary: {
          DEFAULT: '#1E293B', // navy
          hover: '#0F172A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          primary: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        // Keep existing for backward compatibility if needed, but prefer above
        navy: '#1E293B',
        'sky-blue': '#0EA5E9',
        'soft-grey': '#CBD5E1',
        'text-grey': '#475569',
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glow': '0 0 15px rgba(14, 165, 233, 0.3)',
      }
    },
  },
  plugins: [],
};
