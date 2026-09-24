export const colors = {
  primary: '#90BC48',
  primaryDark: '#2F7F3D',
  background: '#F7F8F9',
  surface: '#FFFFFF',
  secondary: '#889682',
  text: '#172015',
  muted: '#858585',
  border: '#C9C9C9',
  danger: '#A32626',
  dangerSurface: '#FCEAEA',
  placeholder: '#E9EDE5',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 8, md: 14, lg: 22 } as const;
export const typography = { small: 13, body: 16, subtitle: 20, title: 28 } as const;
export const dimensions = { touchTarget: 44, inputHeight: 56, buttonHeight: 56, headerHeight: 64, headerIconSize: 24, headerSideWidth: 88, bottomNavigationHeight: 64, contentMaxWidth: 680, imageAspectRatio: 16 / 9 } as const;
export const shadows = {
  card: { shadowColor: '#000000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
} as const;
