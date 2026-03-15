// ============================================================
// SubPay Africa — Design System 2026
// Dark mode by default, glassmorphism, premium UI
// ============================================================

export const Colors = {
  // Brand
  primary: '#7C3AED',       // Violet principal
  primaryLight: '#A78BFA',  // Violet clair
  primaryDark: '#5B21B6',   // Violet foncé
  secondary: '#06B6D4',     // Cyan accent

  // Gradients
  gradientStart: '#0F0A1E',
  gradientMid: '#1A0B3D',
  gradientEnd: '#0D1B4B',

  // Dark theme
  dark: {
    background: '#0F0A1E',
    surface: '#1A1035',
    surfaceVariant: '#251548',
    card: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.10)',
    text: '#FFFFFF',
    textSecondary: '#A0A0C0',
    textMuted: '#60607A',
    border: 'rgba(255,255,255,0.08)',
    overlay: 'rgba(0,0,0,0.7)',
  },

  // Light theme
  light: {
    background: '#F8F7FF',
    surface: '#FFFFFF',
    surfaceVariant: '#EDE9FE',
    card: 'rgba(255,255,255,0.9)',
    cardBorder: 'rgba(0,0,0,0.06)',
    text: '#1A0B3D',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: 'rgba(0,0,0,0.08)',
    overlay: 'rgba(0,0,0,0.5)',
  },

  // Services
  netflix: '#E50914',
  spotify: '#1DB954',
  appleMusic: '#FC3C44',
  psn: '#003087',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Operators
  orangeMoney: '#FF6600',
  mtnMomo: '#FFCC00',
  airtelMoney: '#FF0000',
  moovMoney: '#00AAFF',
  corisMoney: '#006633',
};

export const Typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 30,
    '3xl': 36,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const Shadows = {
  glow: {
    primary: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

// Service branding
export const SERVICE_BRANDS = {
  NETFLIX: {
    name: 'Netflix',
    color: '#E50914',
    gradient: ['#8B0000', '#E50914'],
    emoji: '🎬',
    description: 'Films & Séries en streaming',
  },
  SPOTIFY: {
    name: 'Spotify',
    color: '#1DB954',
    gradient: ['#145A32', '#1DB954'],
    emoji: '🎵',
    description: 'Musique sans publicité',
  },
  APPLE_MUSIC: {
    name: 'Apple Music',
    color: '#FC3C44',
    gradient: ['#9B1B2A', '#FC3C44'],
    emoji: '🎶',
    description: '100M+ titres à écouter',
  },
  PSN: {
    name: 'PlayStation',
    color: '#003087',
    gradient: ['#001850', '#003087'],
    emoji: '🎮',
    description: 'Jeux & Wallet PSN',
  },
};

// Operator branding
export const OPERATOR_BRANDS = {
  ORANGE_MONEY: {
    name: 'Orange Money',
    color: '#FF6600',
    textColor: '#FFFFFF',
    gradient: ['#CC5200', '#FF6600'],
  },
  MTN_MOMO: {
    name: 'MTN Mobile Money',
    color: '#FFCC00',
    textColor: '#1A1A1A',
    gradient: ['#CC9900', '#FFCC00'],
  },
  AIRTEL_MONEY: {
    name: 'Airtel Money',
    color: '#FF0000',
    textColor: '#FFFFFF',
    gradient: ['#CC0000', '#FF0000'],
  },
  MOOV_MONEY: {
    name: 'Moov Money',
    color: '#00AAFF',
    textColor: '#FFFFFF',
    gradient: ['#0077CC', '#00AAFF'],
  },
  CORIS_MONEY: {
    name: 'Coris Money',
    color: '#006633',
    textColor: '#FFFFFF',
    gradient: ['#004422', '#006633'],
  },
};
