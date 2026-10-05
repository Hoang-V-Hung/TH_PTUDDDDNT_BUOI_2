import { useState } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWeather } from './useWeather';
import { HourlyData } from '../types';

export const useHourlyDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { weatherData } = useWeather();

  const initialIndex = route.params?.hourIndex ?? 0;
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

  const hourlyList: HourlyData[] = weatherData?.hourly || [];
  const selectedHour: HourlyData = hourlyList[selectedIndex] || hourlyList[0];
  const cityName = weatherData?.current?.city || 'Hà Nội';

  const getIconColor = (iconName: string, defaultColor: string) => {
    if (iconName === 'sunny' || iconName === 'partly-sunny') return '#FBBF24';
    if (iconName === 'rainy' || iconName === 'rainy-outline' || iconName === 'water') return '#38BDF8';
    if (iconName === 'cloudy' || iconName === 'cloud') return '#FFFFFF';
    return defaultColor;
  };

  const handleSelectHour = (index: number) => {
    setSelectedIndex(index);
  };

  return {
    selectedIndex,
    selectedHour,
    hourlyList,
    cityName,
    getIconColor,
    handleSelectHour,
    navigation,
  };
};
