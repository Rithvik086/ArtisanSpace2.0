// ArtisanSpace Theme - Inspired by craft aesthetics and warm earth tones

export const theme = {
  colors: {
    // Primary craft-inspired earth tones
    primary: {
      50: '#fdf2f8',
      100: '#fce7f3', 
      200: '#fbcfe8',
      300: '#8b5a3c', // Warm brown from landing page
      400: '#7c4a32',
      500: '#6d3e28', // Main brand brown
      600: '#5e321f',
      700: '#4f2718',
      800: '#401c11',
      900: '#31120a'
    },
    
    // Warm secondary colors
    secondary: {
      50: '#fef7ed',
      100: '#fdedd5',
      200: '#fbd8aa',
      300: '#f7bc75', // Warm accent from landing
      400: '#f3a047',
      500: '#ef8b1f',
      600: '#d97518',
      700: '#b45d16',
      800: '#924a18',
      900: '#783e17'
    },

    // Neutral warm grays
    neutral: {
      50: '#faf9f7',
      100: '#f5f3f0',
      200: '#e8e4df', // Background tone from landing
      300: '#d3ccc4',
      400: '#a8a097',
      500: '#857d72',
      600: '#6b635a',
      700: '#54504a',
      800: '#3d3936',
      900: '#2a2724'
    },

    // Status colors with warm undertones
    success: '#059669',
    warning: '#d97706', 
    error: '#dc2626',
    info: '#0369a1'
  },

  typography: {
    fontFamily: {
      primary: '"Inter", system-ui, sans-serif',
      heading: '"Playfair Display", Georgia, serif', // Elegant serif for headings
      craft: '"Merriweather", Georgia, serif' // Craft-inspired serif
    },
    
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem'
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem', 
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem'
  },

  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(139, 90, 60, 0.05)',
    md: '0 4px 6px -1px rgba(139, 90, 60, 0.1), 0 2px 4px -1px rgba(139, 90, 60, 0.06)',
    lg: '0 10px 15px -3px rgba(139, 90, 60, 0.1), 0 4px 6px -2px rgba(139, 90, 60, 0.05)',
    xl: '0 20px 25px -5px rgba(139, 90, 60, 0.1), 0 10px 10px -5px rgba(139, 90, 60, 0.04)'
  }
};

// Component style utilities
export const craftStyles = {
  // Button variants
    button: {
    primary: `
      bg-linear-to-r from-amber-600 to-amber-700 
      hover:from-amber-700 hover:to-amber-800 
      text-white font-medium px-6 py-3 rounded-lg 
      shadow-md hover:shadow-lg transition-all duration-200
      border border-amber-600 hover:border-amber-700
    `,
    secondary: `
      bg-white border-2 border-amber-600 text-amber-700 
      hover:bg-amber-50 font-medium px-6 py-3 rounded-lg
      shadow-sm hover:shadow-md transition-all duration-200
    `,
    ghost: `
      text-amber-700 hover:bg-amber-50 font-medium px-4 py-2 rounded-md
      transition-colors duration-200
    `
  },

  // Card styles
  card: {
    default: `
      bg-white rounded-xl shadow-lg border border-neutral-200
      hover:shadow-xl transition-shadow duration-300
    `,
    warm: `
      bg-linear-to-br from-amber-50 to-orange-50 
      rounded-xl shadow-lg border border-amber-200
      hover:shadow-xl transition-shadow duration-300
    `
  },

  // Input styles
  input: {
    default: `
      w-full px-4 py-3 border border-neutral-300 rounded-lg
      focus:ring-2 focus:ring-amber-500 focus:border-amber-500
      bg-white text-neutral-900 placeholder-neutral-500
      transition-colors duration-200
    `,
    error: `
      border-red-500 focus:ring-red-500 focus:border-red-500
    `
  },

  // Layout styles
  layout: {
    container: `
      max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
    `,
    section: `
      py-12 lg:py-16
    `,
    header: `
      bg-linear-to-r from-neutral-50 to-amber-50 
      border-b border-neutral-200 shadow-sm
    `
  }
};

// Helper function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};