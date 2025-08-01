import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1.5rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Fraunces', 'Inter', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
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
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				},
				'gentle-bounce': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)',
						animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
					},
					'50%': {
						transform: 'translateY(-2px) scale(1.01)',
						animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
					}
				},
				'soft-pulse': {
					'0%, 100%': {
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': {
						opacity: '0.8',
						transform: 'scale(1.02)'
					}
				},
				'emergency-pulse': {
					'0%, 100%': {
						opacity: '0.9',
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.4)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.05)',
						boxShadow: '0 0 0 8px rgba(239, 68, 68, 0.1)'
					}
				},
				'ripple': {
					'0%': {
						transform: 'scale(0)',
						opacity: '0.6'
					},
					'100%': {
						transform: 'scale(4)',
						opacity: '0'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'speak-ready': {
					'0%, 100%': {
						backgroundColor: 'hsl(var(--accent))',
						transform: 'scale(1)'
					},
					'50%': {
						backgroundColor: 'hsl(var(--accent) / 0.9)',
						transform: 'scale(1.08)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'gentle-bounce': 'gentle-bounce 0.6s ease-in-out',
				'soft-pulse': 'soft-pulse 2s ease-in-out infinite',
				'emergency-pulse': 'emergency-pulse 2.5s ease-in-out infinite',
				'ripple': 'ripple 0.6s ease-out',
				'fade-in-up': 'fade-in-up 0.3s ease-out',
				'speak-ready': 'speak-ready 1.5s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
