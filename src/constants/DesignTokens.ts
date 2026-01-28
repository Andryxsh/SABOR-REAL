/**
 * Sabor Real Design Tokens (v2)
 * Extraídos del diseño original para mantener la estética Neon/Glassmorphism.
 */

export const DESIGN_TOKENS = {
    colors: {
        background: {
            dark: '#181114',
            light: '#f8f6f7',
            glass: 'rgba(0, 0, 0, 0.4)',
            headerGlass: 'rgba(0, 0, 0, 0.6)',
        },
        primary: {
            base: '#ee2b8c',
            dark: '#d11a75',
            glow: '#a855f7', // Purple neon glow
        },
        surface: {
            dark: '#271c21',
            light: '#ffffff',
            darker: '#0a0a0a',
            highlight: '#1a1a1a',
        },
        accents: {
            teal: '#2dd4bf',
            emerald: '#10b981',
            rose: '#fb7185',
            pink: '#ec4899',
            blue: '#3b82f6',
            indigo: '#6366f1',
            yellow: '#eab308',
            orange: '#f97316',
        },
        text: {
            primary: '#ffffff',
            secondary: '#b99dab',
            muted: '#64748b',
        }
    },
    animations: {
        durations: {
            fast: '200ms',
            base: '300ms',
            slow: '500ms',
        },
        easings: {
            standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
            out: 'cubic-bezier(0, 0, 0.2, 1)',
            in: 'cubic-bezier(0.4, 0, 1, 1)',
        }
    },
    shadows: {
        neonPurple: '0 0 10px #a855f7',
        neonBlue: '0 0 10px #3b82f6',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    }
};
