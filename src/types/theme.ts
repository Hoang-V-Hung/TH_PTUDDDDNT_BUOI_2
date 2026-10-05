export type TimeOfDayPeriod = 'dawn' | 'day' | 'sunset' | 'night';

export type WeatherType =
  | 'clear'
  | 'partlyCloudy'
  | 'cloudy'
  | 'rain'
  | 'thunderstorm'
  | 'fog'
  | 'snow';

export interface ThemeColors {
  period: TimeOfDayPeriod;
  weatherType: WeatherType;
  periodName: string;
  conditionName: string;
  iconName: string;
  background: string;
  gradientColors: string[];
  ambientGlowColor: string;
  horizonGlowColor?: string;
  cardBackground: string;
  cardBackgroundElevated: string;
  cardBackgroundSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  barBackground: string;
  barFill: string;
  accentBlue: string;
  accentYellow: string;
  accentOrange: string;
  accentGreen: string;
  accentRed: string;
  statusBarStyle: 'light-content' | 'dark-content';
  toolbarBackground: string;
  toolbarBorder: string;
}

export interface ThemeContextType {
  colors: ThemeColors;
  currentPeriod: TimeOfDayPeriod;
  weatherType: WeatherType;
  currentTemp: number;
  isDark: boolean;
  toggleTheme: () => void;
}
