import { DailyData } from './weather';

export interface ChartPoint {
  x: number;
  y: number;
}

export interface DynamicScale {
  degMin: number;
  degMax: number;
  degRange: number;
  gridDegrees: number[];
}

export interface ScrubberDayItem {
  index: number;
  isToday: boolean;
  dayCode: string;
  dateNum: number;
  fullDateStr: string;
  dayData: DailyData;
}

export type MetricKey =
  | 'temperature'
  | 'precipitation'
  | 'feelsLike'
  | 'uv'
  | 'wind'
  | 'sunset'
  | 'visibility'
  | 'humidity'
  | 'pressure';
