import { WeatherData, HourlyData, DailyData } from '../types';

export const generateDefaultWeatherData = (): WeatherData => {
  const now = new Date();
  const currentHour = now.getHours();
  const formatVietnameseHour = (hour: number): string => {
    if (hour === 0) return '12 SA';
    if (hour < 12) return `${hour} SA`;
    if (hour === 12) return '12 CH';
    return `${hour - 12} CH`;
  };

  const daysOfWeek = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // Tạo 24 giờ tiếp theo bắt đầu từ giờ hiện tại
  const hourly: HourlyData[] = [];
  const baseTemps = [25, 24, 24, 23, 23, 24, 26, 28, 30, 32, 33, 33, 32, 31, 30, 29, 28, 27, 26, 26, 25, 25, 25, 25];
  const conditions = [
    { name: 'cloudy-night', color: '#8E8ECC', desc: 'Nhiều mây', pop: 10 },
    { name: 'partly-sunny', color: '#FFA500', desc: 'Có mây', pop: 20 },
    { name: 'cloudy', color: '#FFFFFF', desc: 'Có mây', pop: 10 },
    { name: 'sunny', color: '#FFD700', desc: 'Nắng', pop: 5 },
    { name: 'rainy', color: '#38BDF8', desc: 'Mưa rào nhẹ', pop: 60 },
  ];

  for (let i = 0; i < 24; i++) {
    const targetHour = (currentHour + i) % 24;
    const isDay = targetHour >= 6 && targetHour < 18;
    const temp = baseTemps[targetHour] || 27;
    const condIdx = (targetHour + i) % conditions.length;
    const cond = conditions[condIdx];
    const iconName = isDay
      ? (cond.pop > 50 ? 'rainy' : (cond.pop > 20 ? 'partly-sunny' : 'cloudy'))
      : (cond.pop > 50 ? 'rainy' : 'cloudy-night');
    const iconColor = iconName === 'partly-sunny' ? '#FFA500' : (iconName === 'rainy' ? '#38BDF8' : '#FFFFFF');

    hourly.push({
      id: `def-hourly-${i}`,
      time: i === 0 ? 'Bây giờ' : formatVietnameseHour(targetHour),
      fullTime: `${targetHour}:00`,
      iconName,
      iconColor,
      temp,
      feelsLike: temp + 2,
      humidity: 72 + (i % 15),
      pop: (i * 7) % 80,
      rain: ((i * 3) % 10) / 5,
      windSpeed: 10 + (i % 8),
      windDirection: 45,
      windDirectionText: 'Đông Bắc',
      uvIndex: isDay ? Math.min(8, Math.max(1, 8 - Math.abs(12 - targetHour))) : 0,
      visibility: 10,
      condition: cond.desc,
    });
  }

  // Tạo 10 ngày tiếp theo (chuẩn Apple Weather)
  const daily: DailyData[] = [];
  const dailyHighs = [27, 28, 29, 30, 31, 32, 30, 29, 28, 27];
  const dailyLows = [22, 21, 19, 20, 21, 22, 21, 20, 20, 19];
  const dailyConditions = ['Có mây', 'Có mây', 'Nắng', 'Nắng', 'Mưa rào', 'Có mây rải rác', 'Nắng', 'Có mây', 'Mưa rào', 'Nhiều mây'];
  const dailyIcons = ['partly-sunny', 'partly-sunny', 'sunny', 'sunny', 'rainy', 'partly-sunny', 'sunny', 'cloudy', 'rainy', 'cloudy'];
  const dailyColors = ['#FFA500', '#FFA500', '#FFD700', '#FFD700', '#38BDF8', '#FFA500', '#FFD700', '#FFFFFF', '#38BDF8', '#FFFFFF'];

  for (let i = 0; i < 10; i++) {
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + i);
    const dayName = i === 0 ? 'Hôm nay' : daysOfWeek[targetDate.getDay()];
    const dateFormatted = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;

    daily.push({
      id: `def-daily-${i}`,
      day: dayName,
      dateStr: dateFormatted,
      iconName: dailyIcons[i % dailyIcons.length],
      iconColor: dailyColors[i % dailyColors.length],
      condition: dailyConditions[i % dailyConditions.length],
      low: dailyLows[i % dailyLows.length],
      high: dailyHighs[i % dailyHighs.length],
      feelsLikeMax: dailyHighs[i % dailyHighs.length] + 2,
      pop: [30, 75, 85, 40, 10, 5, 20][i % 7],
      precipitation: [1.2, 8.5, 14.2, 2.0, 0, 0, 0.4][i % 7],
      uvIndex: [6, 4, 3, 7, 9, 8, 7][i % 7],
      uvText: ['Cao', 'Trung bình', 'Thấp', 'Cao', 'Rất cao', 'Rất cao', 'Cao'][i % 7],
      windSpeed: [14, 18, 22, 12, 10, 11, 13][i % 7],
      windDirection: 45,
      windDirectionText: 'Đông Bắc',
      sunrise: '05:48',
      sunset: '17:42',
    });
  }

  const currentHourData = hourly[0];

  return {
    current: {
      city: 'Hà Nội',
      temp: currentHourData.temp,
      condition: currentHourData.condition,
      high: daily[0].high,
      low: daily[0].low,
      feelsLike: currentHourData.feelsLike,
      humidity: currentHourData.humidity,
      windSpeed: currentHourData.windSpeed,
      windDirection: currentHourData.windDirection,
      windDirectionText: 'Đông Bắc (NE)',
      uvIndex: currentHourData.uvIndex || 5,
      uvText: currentHourData.uvIndex > 7 ? 'Rất cao' : (currentHourData.uvIndex > 5 ? 'Cao' : 'Trung bình'),
      precipitation: 1.2,
      visibility: 10,
      isDay: currentHour >= 6 && currentHour < 18,
      weatherCode: 2,
      iconName: currentHourData.iconName,
      iconColor: currentHourData.iconColor,
      sunrise: daily[0]?.sunrise || '05:48',
      sunset: daily[0]?.sunset || '17:42',
      pressure: 1014,
    },
    hourly,
    daily,
    yesterday: {
      id: 'def-daily-yesterday',
      day: 'Hôm qua',
      dateStr: `${(now.getDate() - 1).toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}`,
      iconName: 'partly-sunny',
      iconColor: '#FFA500',
      condition: 'Có mây',
      low: 21,
      high: 28,
      feelsLikeMax: 29,
      pop: 20,
      precipitation: 0,
      uvIndex: 5,
      uvText: 'Trung bình',
      windSpeed: 12,
      windDirection: 45,
      windDirectionText: 'Đông Bắc',
      sunrise: '05:48',
      sunset: '17:42',
    },
    lastUpdated: 'Vừa xong',
  };
};
