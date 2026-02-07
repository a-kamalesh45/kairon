/**
 * KAIRON Design Tokens
 * Institutional Trading Terminal Color System
 * 
 * Usage: Import this file to access color tokens programmatically
 * or reference for design tools (Figma, Sketch, etc.)
 */

export const KaironColors = {
    /**
     * BACKGROUNDS - The Void
     * True black foundation for reduced eye fatigue
     */
    background: {
        app: '#000000',       // Main application background
        panel: '#0A0B0D',     // Cards, panels, sections
        hover: '#12141A',     // Hover state for interactive elements
        elevated: '#1A1C23',  // Modals, dropdowns, tooltips
    },

    /**
     * PRIMARY ACCENT - Cyan
     * RESTRICTED USE: CTAs, active states, live indicators only
     * DO NOT use for decoration or passive UI elements
     */
    accent: {
        primary: '#00D9E8',       // Main accent color (cooler cyan)
        primaryHover: '#00B8CC',  // Hover state
        primaryMuted: '#004D55',  // Disabled/inactive state
    },

    /**
     * TEXT HIERARCHY - White to Gray Gradient
     * Clear visual priority from critical data to metadata
     */
    text: {
        primary: '#FFFFFF',     // Critical data: prices, main headers
        secondary: '#B4BCC8',   // Supporting info: labels, secondary headers
        tertiary: '#6B7280',    // Metadata: timestamps, IDs, volume
        disabled: '#3F4449',    // Inactive: disabled buttons, unavailable options
    },

    /**
     * P&L COLORS - Analytical, Not Emotional
     * Cool tones for professional, institutional feel
     */
    profit: {
        text: '#00C896',      // Gains (cyan-tinted green for palette cohesion)
        background: '#002820', // Subtle success background
    },
    loss: {
        text: '#D63031',      // Losses (deep red, not pink - professional)
        background: '#2A1416', // Subtle danger background
    },

    /**
     * BORDERS & DIVIDERS - Subtle Separation
     * Low contrast for minimal visual noise
     */
    border: {
        default: '#1F2128',    // Default borders and dividers
        hover: '#2A2D38',      // Interactive element borders
        focus: '#00D9E8',      // Focus state (cyan)
    },

    /**
     * LEGACY (Deprecated - will be removed)
     * Maintained for backward compatibility
     */
    legacy: {
        neonCyan: '#00D9E8',   // Use accent.primary instead
        neonPink: '#B32D36',   // Use loss.text instead
    },
} as const;

/**
 * Light Theme (for reference - not primary use case)
 */
export const KaironColorsLight = {
    background: {
        app: '#FFFFFF',
        panel: '#F7F8FA',
        hover: '#E8EAED',
        elevated: '#FFFFFF',
    },
    accent: {
        primary: '#0099AA',
        primaryHover: '#007A88',
        primaryMuted: '#B3E5EA',
    },
    text: {
        primary: '#0F1419',
        secondary: '#536471',
        tertiary: '#8B98A5',
        disabled: '#CFD9DE',
    },
    profit: {
        text: '#00A878',
        background: '#E6F7F2',
    },
    loss: {
        text: '#C23030',
        background: '#FCE8E8',
    },
    border: {
        default: '#E1E8ED',
        hover: '#C1CBD4',
        focus: '#0099AA',
    },
} as const;

/**
 * CSS Variable Mapping
 * For use in styled-components or CSS-in-JS
 */
export const KaironCSSVars = {
    // Backgrounds
    '--color-bg-app': KaironColors.background.app,
    '--color-bg-panel': KaironColors.background.panel,
    '--color-bg-hover': KaironColors.background.hover,
    '--color-bg-elevated': KaironColors.background.elevated,

    // Accent
    '--color-accent-primary': KaironColors.accent.primary,
    '--color-accent-primary-hover': KaironColors.accent.primaryHover,
    '--color-accent-primary-muted': KaironColors.accent.primaryMuted,

    // Text
    '--color-text-primary': KaironColors.text.primary,
    '--color-text-secondary': KaironColors.text.secondary,
    '--color-text-tertiary': KaironColors.text.tertiary,
    '--color-text-disabled': KaironColors.text.disabled,

    // P&L
    '--color-success': KaironColors.profit.text,
    '--color-success-bg': KaironColors.profit.background,
    '--color-danger': KaironColors.loss.text,
    '--color-danger-bg': KaironColors.loss.background,

    // Borders
    '--color-border': KaironColors.border.default,
    '--color-border-hover': KaironColors.border.hover,
    '--color-border-focus': KaironColors.border.focus,
} as const;

/**
 * Tailwind Config Extension
 * Add this to your tailwind.config.js
 */
export const tailwindTheme = {
    extend: {
        colors: {
            'kairon-bg-app': KaironColors.background.app,
            'kairon-bg-panel': KaironColors.background.panel,
            'kairon-bg-hover': KaironColors.background.hover,
            'kairon-bg-elevated': KaironColors.background.elevated,
            'kairon-accent': KaironColors.accent.primary,
            'kairon-accent-hover': KaironColors.accent.primaryHover,
            'kairon-accent-muted': KaironColors.accent.primaryMuted,
            'kairon-text': KaironColors.text.primary,
            'kairon-text-secondary': KaironColors.text.secondary,
            'kairon-text-tertiary': KaironColors.text.tertiary,
            'kairon-text-disabled': KaironColors.text.disabled,
            'kairon-success': KaironColors.profit.text,
            'kairon-success-bg': KaironColors.profit.background,
            'kairon-danger': KaironColors.loss.text,
            'kairon-danger-bg': KaironColors.loss.background,
            'kairon-border': KaironColors.border.default,
            'kairon-border-hover': KaironColors.border.hover,
            'kairon-border-focus': KaironColors.border.focus,
        },
    },
};

/**
 * Type Definitions
 */
export type KaironColorToken = typeof KaironColors;
export type KaironBackgroundColor = keyof typeof KaironColors.background;
export type KaironTextColor = keyof typeof KaironColors.text;
export type KaironAccentColor = keyof typeof KaironColors.accent;
export type KaironBorderColor = keyof typeof KaironColors.border;

/**
 * Utility Functions
 */
export const getColorVar = (path: string): string => {
    const keys = path.split('.');
    let value: any = KaironColors;
    for (const key of keys) {
        value = value[key];
    }
    return value as string;
};

export const rgba = (hex: string, alpha: number): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Usage Examples:
 * 
 * // In React/TypeScript:
 * import { KaironColors } from './design-tokens';
 * <div style={{ backgroundColor: KaironColors.background.app }} />
 * 
 * // In styled-components:
 * import { KaironColors } from './design-tokens';
 * const Button = styled.button`
 *   background-color: ${KaironColors.accent.primary};
 *   color: ${KaironColors.text.primary};
 * `;
 * 
 * // In Tailwind CSS:
 * <div className="bg-kairon-bg-app text-kairon-text">
 * 
 * // With opacity:
 * import { rgba, KaironColors } from './design-tokens';
 * <div style={{ backgroundColor: rgba(KaironColors.background.panel, 0.8) }} />
 */
