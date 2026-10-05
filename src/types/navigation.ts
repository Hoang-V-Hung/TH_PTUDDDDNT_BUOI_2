import { HourlyData, DailyData } from './weather';

export type RootStackParamList = {
  Home: undefined;
  HourlyDetail: {
    hourIndex: number;
    initialData?: HourlyData;
  };
  DailyDetail: {
    dayIndex: number;
    initialData?: DailyData;
    metricKey?: string;
  };
  LocationSearch: undefined;
};
