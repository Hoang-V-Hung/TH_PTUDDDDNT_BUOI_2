import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cacheService } from '../services/cacheService';

export type TimeOfDayPeriod = 'dawn' | 'day' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'partlyCloudy' | 'cloudy' | 'rain' | 'thunderstorm' | 'fog' | 'snow';

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

// 1. Phân loại mã thời tiết chuẩn WMO sang dạng khí tượng iOS
export const getWeatherTypeFromCode = (code: number): WeatherType => {
  if (code === 0 || code === 1) return 'clear';
  if (code === 2) return 'partlyCloudy';
  if (code === 3) return 'cloudy';
  if (code === 45 || code === 48) return 'fog';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'snow';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'clear';
};

// 2. Xác định khung thời gian thực tế trong ngày
export const getPeriodByRealTime = (date: Date = new Date()): TimeOfDayPeriod => {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const timeInHours = hour + minute / 60;

  if (timeInHours >= 5 && timeInHours < 7) {
    return 'dawn'; // 05:00 - 07:00: Bình minh
  }
  if (timeInHours >= 7 && timeInHours < 16.5) {
    return 'day'; // 07:00 - 16:30: Ban ngày
  }
  if (timeInHours >= 16.5 && timeInHours < 18.75) {
    return 'sunset'; // 16:30 - 18:45: Hoàng hôn
  }
  return 'night'; // 18:45 - 05:00: Ban đêm
};

// 3. Động cơ sinh màu khí quyển chuẩn Apple Weather iOS (kết hợp Thời gian + Thời tiết + Nhiệt độ)
export const generateAtmosphericTheme = (
  period: TimeOfDayPeriod,
  weatherType: WeatherType,
  temperature: number = 26
): ThemeColors => {
  let gradientColors: string[];
  let cardBackground: string;
  let cardBackgroundElevated: string;
  let borderColor: string;
  let ambientGlowColor: string;
  let iconName: string = 'sunny';
  let periodName: string = 'Ban Ngày';
  let conditionName: string = 'Quang đãng';

  // --- A. BẢNG MÀU THEO THỜI GIAN & ĐIỀU KIỆN KHÍ TƯỢNG ---
  if (period === 'dawn') {
    periodName = 'Bình Minh';
    iconName = 'sunny-outline';
    if (weatherType === 'rain' || weatherType === 'thunderstorm') {
      conditionName = weatherType === 'thunderstorm' ? 'Dông bão' : 'Mưa rào';
      gradientColors = ['#151928', '#202638', '#31384C', '#454C61', '#5B6276'];
      cardBackground = 'rgba(26, 30, 48, 0.48)';
      cardBackgroundElevated = 'rgba(34, 40, 62, 0.68)';
      borderColor = 'rgba(255, 255, 255, 0.18)';
      ambientGlowColor = 'rgba(56, 189, 248, 0.08)';
    } else if (weatherType === 'cloudy' || weatherType === 'fog') {
      conditionName = weatherType === 'fog' ? 'Sương mù' : 'Nhiều mây';
      gradientColors = ['#1E2235', '#2F344A', '#474A61', '#666579', '#8A8596'];
      cardBackground = 'rgba(32, 34, 52, 0.45)';
      cardBackgroundElevated = 'rgba(44, 46, 70, 0.65)';
      borderColor = 'rgba(255, 255, 255, 0.20)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.10)';
    } else {
      // Bình minh trong lành
      conditionName = weatherType === 'partlyCloudy' ? 'Có mây rải rác' : 'Quang đãng';
      gradientColors = ['#1B2244', '#343B68', '#5E4F71', '#A6606F', '#DE8972', '#F7B28B'];
      cardBackground = 'rgba(38, 28, 54, 0.42)';
      cardBackgroundElevated = 'rgba(48, 34, 68, 0.65)';
      borderColor = 'rgba(255, 225, 215, 0.24)';
      ambientGlowColor = 'rgba(247, 178, 139, 0.20)';
    }
  } else if (period === 'day') {
    periodName = 'Ban Ngày';
    iconName = 'sunny';
    if (weatherType === 'thunderstorm') {
      conditionName = 'Dông sét dữ dội';
      iconName = 'thunderstorm';
      gradientColors = ['#0F1724', '#151D2C', '#1D2536', '#263042', '#343E50'];
      cardBackground = 'rgba(14, 18, 28, 0.65)';
      cardBackgroundElevated = 'rgba(20, 26, 40, 0.80)';
      borderColor = 'rgba(255, 255, 255, 0.16)';
      ambientGlowColor = 'rgba(192, 132, 252, 0.12)';
    } else if (weatherType === 'rain') {
      conditionName = 'Mưa rào';
      iconName = 'rainy';
      gradientColors = ['#1B2735', '#243345', '#334458', '#45576D', '#5E7289'];
      cardBackground = 'rgba(18, 28, 40, 0.52)';
      cardBackgroundElevated = 'rgba(26, 40, 56, 0.72)';
      borderColor = 'rgba(148, 163, 184, 0.22)';
      ambientGlowColor = 'rgba(56, 189, 248, 0.10)';
    } else if (weatherType === 'cloudy') {
      conditionName = 'Nhiều mây';
      iconName = 'cloud';
      // Sắc xám bạc chì thanh lịch, desaturated chuẩn Apple
      gradientColors = ['#2B394A', '#3C4D61', '#54687F', '#72869D', '#98AABE'];
      cardBackground = 'rgba(32, 44, 58, 0.48)';
      cardBackgroundElevated = 'rgba(44, 58, 76, 0.68)';
      borderColor = 'rgba(255, 255, 255, 0.20)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.10)';
    } else if (weatherType === 'fog') {
      conditionName = 'Sương mù';
      iconName = 'cloud';
      gradientColors = ['#3E4C59', '#526270', '#6B7C8C', '#8899A8', '#A9BAC7'];
      cardBackground = 'rgba(45, 56, 66, 0.45)';
      cardBackgroundElevated = 'rgba(60, 72, 84, 0.65)';
      borderColor = 'rgba(255, 255, 255, 0.22)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.12)';
    } else if (weatherType === 'snow') {
      conditionName = 'Tuyết rơi';
      iconName = 'snow';
      gradientColors = ['#2C4158', '#405B77', '#5C7A99', '#7F9EBD', '#A8C3DF'];
      cardBackground = 'rgba(28, 44, 62, 0.45)';
      cardBackgroundElevated = 'rgba(40, 60, 84, 0.65)';
      borderColor = 'rgba(255, 255, 255, 0.26)';
      ambientGlowColor = 'rgba(224, 242, 254, 0.18)';
    } else if (weatherType === 'partlyCloudy') {
      conditionName = 'Có mây';
      iconName = 'partly-sunny';
      gradientColors = ['#2870B8', '#3782CD', '#4F96DF', '#73B0EB', '#9BC7F2'];
      cardBackground = 'rgba(20, 60, 100, 0.38)';
      cardBackgroundElevated = 'rgba(16, 52, 90, 0.58)';
      borderColor = 'rgba(255, 255, 255, 0.25)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.15)';
    } else {
      // Trời nắng xanh trong vắt chuẩn Apple Weather iOS
      conditionName = 'Trời nắng';
      gradientColors = ['#2570C4', '#3482D5', '#4A95E4', '#6EAFEF', '#94CAF6'];
      cardBackground = 'rgba(18, 56, 96, 0.38)';
      cardBackgroundElevated = 'rgba(14, 48, 84, 0.58)';
      borderColor = 'rgba(255, 255, 255, 0.26)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.16)';
    }
  } else if (period === 'sunset') {
    periodName = 'Hoàng Hôn';
    iconName = 'partly-sunny';
    if (weatherType === 'rain' || weatherType === 'thunderstorm') {
      conditionName = weatherType === 'thunderstorm' ? 'Dông chiều' : 'Mưa chiều';
      gradientColors = ['#181522', '#241F30', '#342D40', '#473E54', '#5D526A'];
      cardBackground = 'rgba(30, 24, 38, 0.52)';
      cardBackgroundElevated = 'rgba(40, 32, 50, 0.70)';
      borderColor = 'rgba(255, 255, 255, 0.18)';
      ambientGlowColor = 'rgba(251, 146, 60, 0.10)';
    } else if (weatherType === 'cloudy' || weatherType === 'fog') {
      conditionName = 'Chiều nhiều mây';
      gradientColors = ['#221A28', '#34263B', '#4D3652', '#69486D', '#875E8A'];
      cardBackground = 'rgba(36, 26, 42, 0.46)';
      cardBackgroundElevated = 'rgba(48, 34, 56, 0.66)';
      borderColor = 'rgba(255, 200, 215, 0.20)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.10)';
    } else {
      // Hoàng hôn rực rỡ
      conditionName = 'Hoàng hôn rực rỡ';
      gradientColors = ['#17142A', '#2D1F49', '#572758', '#8E3253', '#CA4C3F', '#F48338'];
      cardBackground = 'rgba(44, 20, 48, 0.44)';
      cardBackgroundElevated = 'rgba(56, 24, 60, 0.66)';
      borderColor = 'rgba(255, 200, 180, 0.26)';
      ambientGlowColor = 'rgba(244, 131, 56, 0.22)';
    }
  } else {
    // Ban Đêm
    periodName = 'Ban Đêm';
    iconName = 'moon';
    if (weatherType === 'thunderstorm') {
      conditionName = 'Dông bão đêm';
      iconName = 'thunderstorm';
      gradientColors = ['#030508', '#060A10', '#0B101C', '#121626', '#1A1D30'];
      cardBackground = 'rgba(8, 10, 16, 0.65)';
      cardBackgroundElevated = 'rgba(12, 16, 26, 0.85)';
      borderColor = 'rgba(255, 255, 255, 0.14)';
      ambientGlowColor = 'rgba(192, 132, 252, 0.10)';
    } else if (weatherType === 'rain') {
      conditionName = 'Mưa đêm';
      iconName = 'rainy';
      gradientColors = ['#05080E', '#0A101A', '#111926', '#182435', '#223044'];
      cardBackground = 'rgba(12, 18, 28, 0.58)';
      cardBackgroundElevated = 'rgba(18, 26, 40, 0.78)';
      borderColor = 'rgba(255, 255, 255, 0.15)';
      ambientGlowColor = 'rgba(56, 189, 248, 0.08)';
    } else if (weatherType === 'cloudy') {
      conditionName = 'Đêm nhiều mây';
      iconName = 'cloudy-night';
      gradientColors = ['#080C14', '#0E1522', '#161F30', '#1F2A3F', '#2A3750'];
      cardBackground = 'rgba(16, 22, 34, 0.55)';
      cardBackgroundElevated = 'rgba(22, 30, 48, 0.75)';
      borderColor = 'rgba(255, 255, 255, 0.16)';
      ambientGlowColor = 'rgba(255, 255, 255, 0.06)';
    } else {
      // Đêm quang đãng
      conditionName = 'Đêm trong';
      gradientColors = ['#060914', '#0B1226', '#101C38', '#16284C', '#1C3663'];
      cardBackground = 'rgba(16, 28, 54, 0.50)';
      cardBackgroundElevated = 'rgba(22, 38, 72, 0.70)';
      borderColor = 'rgba(255, 255, 255, 0.18)';
      ambientGlowColor = 'rgba(56, 189, 248, 0.10)';
    }
  }

  // --- B. BIẾN ĐIỆU THEO NHIỆT ĐỘ (Color Temperature Tint) ---
  // Nếu nhiệt độ rất cao (>33°C): Tăng sắc ấm hổ phách ở đường chân trời
  let horizonGlowColor: string | undefined;
  if (temperature > 33 && period === 'day') {
    horizonGlowColor = 'rgba(245, 158, 11, 0.12)';
  } else if (temperature < 14) {
    // Nếu rét lạnh (<14°C): Tăng sắc lạnh băng tuyết
    horizonGlowColor = 'rgba(56, 189, 248, 0.10)';
  }

  return {
    period,
    weatherType,
    periodName,
    conditionName,
    iconName,
    background: gradientColors[0],
    gradientColors,
    ambientGlowColor,
    horizonGlowColor,
    cardBackground,
    cardBackgroundElevated,
    cardBackgroundSubtle: 'rgba(255, 255, 255, 0.18)',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.90)',
    textMuted: 'rgba(255, 255, 255, 0.68)',
    borderColor,
    barBackground: 'rgba(0, 0, 0, 0.22)',
    barFill: '#F59E0B',
    accentBlue: '#38BDF8',
    accentYellow: '#FCD34D',
    accentOrange: '#FB923C',
    accentGreen: '#4ADE80',
    accentRed: '#F87171',
    statusBarStyle: 'light-content',
    toolbarBackground: 'rgba(255, 255, 255, 0.22)',
    toolbarBorder: borderColor,
  };
};

interface ThemeContextType {
  colors: ThemeColors;
  currentPeriod: TimeOfDayPeriod;
  weatherType: WeatherType;
  currentTemp: number;
  isDark: boolean;
  toggleTheme: () => void;
}

const defaultTheme = generateAtmosphericTheme('day', 'clear', 26);

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultTheme,
  currentPeriod: 'day',
  weatherType: 'clear',
  currentTemp: 26,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface Props {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
  // Lấy dữ liệu thời tiết ban đầu từ cache ngay lập tức để không bị trễ
  const initialCache = cacheService.getCachedData();
  const initialPeriod = getPeriodByRealTime();
  const initialWeatherType = getWeatherTypeFromCode(initialCache?.current?.weatherCode ?? 0);
  const initialTemp = initialCache?.current?.temp ?? 26;

  const [currentPeriod, setCurrentPeriod] = useState<TimeOfDayPeriod>(initialPeriod);
  const [weatherType, setWeatherType] = useState<WeatherType>(initialWeatherType);
  const [currentTemp, setCurrentTemp] = useState<number>(initialTemp);

  // 1. Tự động kiểm tra thay đổi thời gian thực mỗi 30 giây (Bình minh, Ngày, Hoàng hôn, Đêm)
  useEffect(() => {
    const updateRealTime = () => {
      const detected = getPeriodByRealTime();
      setCurrentPeriod((prev) => (prev !== detected ? detected : prev));
    };

    updateRealTime();
    const interval = setInterval(updateRealTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // 2. Lắng nghe cập nhật thời tiết thực tế từ Open-Meteo qua cacheService
  useEffect(() => {
    const unsubscribe = cacheService.subscribe((newData) => {
      if (newData?.current) {
        const newWType = getWeatherTypeFromCode(newData.current.weatherCode);
        const newTemp = newData.current.temp;
        setWeatherType((prev) => (prev !== newWType ? newWType : prev));
        setCurrentTemp((prev) => (prev !== newTemp ? newTemp : prev));
      }
    });

    return unsubscribe;
  }, []);

  // Sinh theme động khí quyển thời gian thực kết hợp: Thời gian + Thời tiết + Nhiệt độ
  const currentColors = generateAtmosphericTheme(currentPeriod, weatherType, currentTemp);
  const isDark = currentPeriod === 'night' || currentPeriod === 'sunset' || weatherType === 'thunderstorm';

  const value: ThemeContextType = {
    colors: currentColors,
    currentPeriod,
    weatherType,
    currentTemp,
    isDark,
    toggleTheme: () => {},
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
