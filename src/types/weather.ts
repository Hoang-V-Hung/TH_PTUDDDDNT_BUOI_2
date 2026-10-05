export interface CurrentData {
  city: string;
  temp: number;
  condition: string;
  high: number;
  low: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  uvIndex: number;
  uvText: string;
  precipitation: number;
  visibility: number;
  isDay: boolean;
  weatherCode: number;
  iconName: string;
  iconColor: string;
  sunrise?: string;
  sunset?: string;
  pressure?: number;
}

export interface HourlyData {
  id: string;
  time: string;
  fullTime: string;
  iconName: string;
  iconColor: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  pop: number; // Xác suất mưa (%)
  rain: number; // Lượng mưa (mm)
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  uvIndex: number;
  visibility: number;
  condition: string;
}

export interface DailyData {
  id: string;
  day: string;
  dateStr: string;
  iconName: string;
  iconColor: string;
  condition: string;
  low: number;
  high: number;
  feelsLikeMax: number;
  pop: number; // Xác suất mưa cao nhất (%)
  precipitation: number; // Tổng lượng mưa (mm)
  uvIndex: number;
  uvText: string;
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  sunrise: string;
  sunset: string;
  hourly?: HourlyData[];
}

export interface WeatherData {
  current: CurrentData;
  hourly: HourlyData[];
  daily: DailyData[];
  yesterday?: DailyData;
  lastUpdated: string;
}

export type { RootStackParamList } from './navigation';
