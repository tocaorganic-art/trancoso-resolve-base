/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Nunito', 'ui-rounded', 'Segoe UI', 'system-ui', 'sans-serif'],
  			display: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
  			nunito: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'brand-xs': 'var(--radius-xs)',
  			'brand-sm': 'var(--radius-sm)',
  			'brand-md': 'var(--radius-md)',
  			'brand-lg': 'var(--radius-lg)',
  			'brand-xl': 'var(--radius-xl)',
  			'brand-2xl': 'var(--radius-2xl)',
  			pill: 'var(--radius-pill)'
  		},
  		boxShadow: {
  			'warm-xs': 'var(--shadow-xs)',
  			'warm-sm': 'var(--shadow-sm)',
  			'warm-md': 'var(--shadow-md)',
  			'warm-lg': 'var(--shadow-lg)',
  			'warm-xl': 'var(--shadow-xl)',
  			brand: 'var(--shadow-brand)'
  		},
  		colors: {
  			brand: {
  				DEFAULT: 'var(--brand-primary)',
  				primary: 'var(--brand-primary)',
  				'primary-hover': 'var(--brand-primary-hover)',
  				'primary-press': 'var(--brand-primary-press)',
  				secondary: 'var(--brand-secondary)',
  				accent: 'var(--brand-accent)'
  			},
  			orange: {
  				50: 'var(--orange-50)', 100: 'var(--orange-100)', 200: 'var(--orange-200)',
  				300: 'var(--orange-300)', 400: 'var(--orange-400)', 500: 'var(--orange-500)',
  				600: 'var(--orange-600)', 700: 'var(--orange-700)', 800: 'var(--orange-800)',
  				900: 'var(--orange-900)'
  			},
  			olive: {
  				50: 'var(--olive-50)', 100: 'var(--olive-100)', 200: 'var(--olive-200)',
  				300: 'var(--olive-300)', 400: 'var(--olive-400)', 500: 'var(--olive-500)',
  				600: 'var(--olive-600)', 700: 'var(--olive-700)', 800: 'var(--olive-800)',
  				900: 'var(--olive-900)'
  			},
  			sand: {
  				DEFAULT: 'var(--sand)', soft: 'var(--sand-soft)', deep: 'var(--sand-deep)'
  			},
  			terracotta: {
  				DEFAULT: 'var(--terracotta)', deep: 'var(--terracotta-deep)'
  			},
  			background: 'hsl(var(--background) / <alpha-value>)',
  			foreground: 'hsl(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'hsl(var(--card) / <alpha-value>)',
  				foreground: 'hsl(var(--card-foreground) / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
  				foreground: 'hsl(var(--popover-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
  				foreground: 'hsl(var(--primary-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
  				foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
  				foreground: 'hsl(var(--muted-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
  				foreground: 'hsl(var(--accent-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
  				foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'hsl(var(--border) / <alpha-value>)',
  			input: 'hsl(var(--input) / <alpha-value>)',
  			ring: 'hsl(var(--ring) / <alpha-value>)',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}