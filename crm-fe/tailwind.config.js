import animatePlugin from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		colors: {
  			secondary: '#085ac0',
  			'primary-fixed-dim': '#b6c6ef',
  			'outline-variant': '#c5c6cf',
  			'surface-container-low': '#eff4ff',
  			'surface-container': '#e6eeff',
  			'on-primary': '#ffffff',
  			'surface-container-high': '#dde9ff',
  			'surface-dim': '#cbdbf5',
  			'tertiary-fixed-dim': '#b8c8e1',
  			error: '#ba1a1a',
  			'on-secondary': '#ffffff',
  			'surface-container-lowest': '#ffffff',
  			'on-surface': '#0b1c30',
  			'inverse-surface': '#213146',
  			'surface-container-highest': '#d3e3ff',
  			'on-tertiary': '#ffffff',
  			'secondary-fixed-dim': '#adc6ff',
  			'on-surface-variant': '#44474e',
  			'status-success': '#10b981',
  			'on-primary-fixed-variant': '#364768',
  			'secondary-container': '#5b94fd',
  			'status-warning': '#f59e0b',
  			'on-tertiary-fixed-variant': '#38485d',
  			'tertiary-fixed': '#d4e4fe',
  			'surface-variant': '#d3e3ff',
  			'surface-tint': '#4e5e81',
  			'on-background': '#0b1c30',
  			outline: '#75777f',
  			'on-error': '#ffffff',
  			'inverse-on-surface': '#ebf1ff',
  			'inverse-primary': '#b6c6ef',
  			'secondary-fixed': '#d8e2ff',
  			'on-primary-container': '#8293b8',
  			'on-error-container': '#93000a',
  			'on-primary-fixed': '#081b3a',
  			'on-secondary-container': '#002c66',
  			primary: '#031635',
  			'surface-bg': '#f8f9ff',
  			'primary-container': '#1a2b4b',
  			'error-container': '#ffdad6',
  			'on-secondary-fixed': '#001a42',
  			background: '#f8f9ff',
  			'on-secondary-fixed-variant': '#004395',
  			'on-tertiary-container': '#8494ab',
  			'on-tertiary-fixed': '#0c1c2f',
  			'status-error': '#ef4444',
  			surface: '#f8f9ff',
  			'primary-fixed': '#d8e2ff',
  			tertiary: '#07172a',
  			'tertiary-container': '#1d2c40',
  			'surface-bright': '#f8f9ff',
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			foreground: 'hsl(var(--foreground))',
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		borderRadius: {
  			DEFAULT: '0.125rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			xl: '0.5rem',
  			full: '0.75rem'
  		},
  		spacing: {
  			base: '4px',
  			'margin-desktop': '32px',
  			'max-width': '1600px',
  			'margin-mobile': '16px',
  			gutter: '16px',
  			'sidebar-width': '260px'
  		},
  		fontFamily: {
  			'label-md': [
  				'Inter'
  			],
  			code: [
  				'Inter'
  			],
  			'headline-lg-mobile': [
  				'Inter'
  			],
  			'headline-lg': [
  				'Inter'
  			],
  			'headline-md': [
  				'Inter'
  			],
  			'headline-sm': [
  				'Inter'
  			],
  			'body-sm': [
  				'Inter'
  			],
  			'body-md': [
  				'Inter'
  			],
  			'body-lg': [
  				'Inter'
  			],
  			sans: [
  				'Be Vietnam Pro',
  				'Inter',
  				'Plus Jakarta Sans',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Plus Jakarta Sans',
  				'Be Vietnam Pro',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono"',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'monospace'
  			]
  		},
  		fontSize: {
  			'label-md': [
  				'12px',
  				{
  					lineHeight: '16px',
  					letterSpacing: '0.05em',
  					fontWeight: '600'
  				}
  			],
  			code: [
  				'13px',
  				{
  					lineHeight: '20px',
  					fontWeight: '400'
  				}
  			],
  			'headline-lg-mobile': [
  				'24px',
  				{
  					lineHeight: '32px',
  					fontWeight: '800'
  				}
  			],
  			'headline-lg': [
  				'48px',
  				{
  					lineHeight: '56px',
  					letterSpacing: '-0.02em',
  					fontWeight: '800'
  				}
  			],
  			'headline-md': [
  				'36px',
  				{
  					lineHeight: '44px',
  					fontWeight: '800'
  				}
  			],
  			'headline-sm': [
  				'24px',
  				{
  					lineHeight: '32px',
  					fontWeight: '700'
  				}
  			],
  			'body-sm': [
  				'14px',
  				{
  					lineHeight: '20px',
  					fontWeight: '400'
  				}
  			],
  			'body-md': [
  				'16px',
  				{
  					lineHeight: '24px',
  					fontWeight: '400'
  				}
  			],
  			'body-lg': [
  				'18px',
  				{
  					lineHeight: '28px',
  					fontWeight: '400'
  				}
  			]
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
  plugins: [animatePlugin],
};
