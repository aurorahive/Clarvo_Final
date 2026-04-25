export const Colors = {
  primary: '#E5B100',
  primaryDark: '#D98C00',
  primaryLight: '#F5CC4A',
  background: '#FAF8F2',
  surface: '#FFFFFF',
  surfaceElevated: '#F5F3ED',
  text: '#1E1E1E',
  textSecondary: '#666666',
  textFaint: '#AAAAAA',
  success: '#2E5E4E',
  successLight: '#E8F4F0',
  warning: '#D98C00',
  warningLight: '#FDF3DC',
  error: '#C0392B',
  errorLight: '#FDEAEA',
  border: 'rgba(30,30,30,0.1)',
  divider: 'rgba(30,30,30,0.07)',
  overlay: 'rgba(0,0,0,0.5)',
  white: '#FFFFFF',
  black: '#000000',
};

export const Typography = {
  fontDisplay: 'System',
  fontBody: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const Spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
};

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, full: 9999,
};
