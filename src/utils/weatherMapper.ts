import { WeatherData, HourlyData, DailyData, RawWeatherData } from '../types';

export const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Quang đãng';
  if (code === 1) return 'Chủ yếu quang đãng';
  if (code === 2) return 'Có mây rải rác';
  if (code === 3) return 'Nhiều mây';
  if (code === 45 || code === 48) return 'Sương mù';
  if (code >= 51 && code <= 55) return 'Mưa phùn';
  if (code >= 56 && code <= 57) return 'Mưa phùn lạnh buốt';
  if (code >= 61 && code <= 65) return 'Mưa rào';
  if (code >= 66 && code <= 67) return 'Mưa lạnh';
  if (code >= 71 && code <= 77) return 'Tuyết rơi';
  if (code >= 80 && code <= 82) return 'Mưa rào lớn';
  if (code >= 85 && code <= 86) return 'Mưa tuyết';
  if (code === 95) return 'Dông sét';
  if (code >= 96 && code <= 99) return 'Mưa dông kèm mưa đá';
  return 'Thời tiết ôn hòa';
};

export const getWeatherIcon = (
  code: number,
  isDay: boolean = true
): { name: string; color: string } => {
  if (code === 0) {
    return {
      name: isDay ? 'sunny' : 'moon',
      color: isDay ? '#FFD700' : '#E0E0FF',
    };
  }
  if (code === 1 || code === 2) {
    return {
      name: isDay ? 'partly-sunny' : 'cloudy-night',
      color: isDay ? '#FFA500' : '#C7D2FE',
    };
  }
  if (code === 3) {
    return {
      name: 'cloudy',
      color: '#FFFFFF', // Mây trắng tinh khôi chuẩn Apple Weather
    };
  }
  if (code === 45 || code === 48) {
    return {
      name: 'cloud',
      color: '#E2E8F0',
    };
  }
  if (code >= 51 && code <= 57) {
    return {
      name: 'rainy',
      color: '#38BDF8',
    };
  }
  if (code >= 61 && code <= 67) {
    return {
      name: 'rainy',
      color: '#38BDF8',
    };
  }
  if (code >= 71 && code <= 77) {
    return {
      name: 'snow',
      color: '#E0F2FE',
    };
  }
  if (code >= 80 && code <= 82) {
    return {
      name: 'rainy',
      color: '#38BDF8',
    };
  }
  if (code >= 85 && code <= 86) {
    return {
      name: 'snow',
      color: '#E0F2FE',
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      name: 'thunderstorm',
      color: '#C084FC',
    };
  }
  return {
    name: isDay ? 'sunny' : 'moon',
    color: '#FFD700',
  };
};

export const getWindDirectionText = (degrees: number): string => {
  const directions = [
    'Bắc (N)',
    'Đông Bắc (NE)',
    'Đông (E)',
    'Đông Nam (SE)',
    'Nam (S)',
    'Tây Nam (SW)',
    'Tây (W)',
    'Tây Bắc (NW)',
  ];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

export const getUVCategory = (uv: number): string => {
  if (uv <= 2) return 'Thấp';
  if (uv <= 5) return 'Trung bình';
  if (uv <= 7) return 'Cao';
  if (uv <= 10) return 'Rất cao';
  return 'Nguy hại';
};

export const mapWeatherData = (raw: RawWeatherData, cityName: string = 'Hà Nội'): WeatherData => {
  const now = new Date();
  const currentHour = now.getHours();
  const formatVietnameseHour = (hour: number): string => {
    if (hour === 0) return '12 SA';
    if (hour < 12) return `${hour} SA`;
    if (hour === 12) return '12 CH';
    return `${hour - 12} CH`;
  };

  const daysOfWeek = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

  // Xác định vị trí ngày hôm nay trong mảng daily
  const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  let todayIndex = raw.daily?.time?.findIndex((t: string) => t.startsWith(todayStr)) ?? -1;
  if (todayIndex === -1) {
    todayIndex = 0;
  }

  const formatTime = (d: Date | null) =>
    d ? `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` : '--:--';

  // Trích xuất dữ liệu hôm qua thực tế (nếu có past_days)
  let yesterday: DailyData | undefined;
  if (todayIndex > 0 && raw.daily?.time?.[todayIndex - 1]) {
    const yIdx = todayIndex - 1;
    const yDateStr = raw.daily.time[yIdx];
    const yDate = new Date(yDateStr);
    const weatherCode = raw.daily.weathercode?.[yIdx] ?? 0;
    const icon = getWeatherIcon(weatherCode, true);
    const low = Math.round(raw.daily.temperature_2m_min?.[yIdx] ?? 22);
    const high = Math.round(raw.daily.temperature_2m_max?.[yIdx] ?? 28);
    const feelsLikeMax = Math.round(raw.daily.apparent_temperature_max?.[yIdx] ?? high);
    const pop = Math.round(raw.daily.precipitation_probability_max?.[yIdx] ?? 0);
    const precipitation = Math.round((raw.daily.precipitation_sum?.[yIdx] ?? 0) * 10) / 10;
    const uvMax = Math.round(raw.daily.uv_index_max?.[yIdx] ?? 5);
    const windSpeedMax = Math.round(raw.daily.wind_speed_10m_max?.[yIdx] ?? 12);
    const windDir = Math.round(raw.daily.wind_direction_10m_dominant?.[yIdx] ?? 0);
    const sunriseDate = raw.daily.sunrise?.[yIdx] ? new Date(raw.daily.sunrise[yIdx]) : null;
    const sunsetDate = raw.daily.sunset?.[yIdx] ? new Date(raw.daily.sunset[yIdx]) : null;

    yesterday = {
      id: 'daily-yesterday',
      day: 'Hôm qua',
      dateStr: `${yDate.getDate().toString().padStart(2, '0')}/${(yDate.getMonth() + 1).toString().padStart(2, '0')}`,
      iconName: icon.name,
      iconColor: icon.color,
      condition: getWeatherDescription(weatherCode),
      low,
      high,
      feelsLikeMax,
      pop,
      precipitation,
      uvIndex: uvMax,
      uvText: getUVCategory(uvMax),
      windSpeed: windSpeedMax,
      windDirection: windDir,
      windDirectionText: getWindDirectionText(windDir),
      sunrise: formatTime(sunriseDate),
      sunset: formatTime(sunsetDate),
    };
  }

  // Tìm index giờ hiện tại trong mảng hourly
  let startIndex = 0;
  if (raw.hourly && raw.hourly.time && raw.hourly.time.length > 0) {
    const foundIdx = raw.hourly.time.findIndex((t: string) => {
      const d = new Date(t);
      return d.getDate() === now.getDate() && d.getHours() === currentHour;
    });
    startIndex = foundIdx !== -1 ? foundIdx : 0;
  }

  // 1. Map 24 giờ tiếp theo (cho HomeScreen)
  const hourly: HourlyData[] = [];
  const maxHours = Math.min(24, (raw.hourly?.time?.length || 0) - startIndex);

  for (let i = 0; i < maxHours; i++) {
    const idx = startIndex + i;
    const timeStr = raw.hourly.time[idx];
    const date = new Date(timeStr);
    const hourNum = date.getHours();
    const isDay = hourNum >= 6 && hourNum < 18;
    const weatherCode = raw.hourly.weathercode?.[idx] ?? 0;
    const icon = getWeatherIcon(weatherCode, isDay);
    const temp = Math.round(raw.hourly.temperature_2m?.[idx] ?? 25);
    const feelsLike = Math.round(raw.hourly.apparent_temperature?.[idx] ?? temp);
    const humidity = Math.round(raw.hourly.relative_humidity_2m?.[idx] ?? 70);
    const pop = Math.round(raw.hourly.precipitation_probability?.[idx] ?? 0);
    const rain = raw.hourly.precipitation?.[idx] ?? 0;
    const windSpeed = Math.round(raw.hourly.wind_speed_10m?.[idx] ?? 10);
    const windDir = Math.round(raw.hourly.wind_direction_10m?.[idx] ?? 0);
    const uvIndex = Math.round(raw.hourly.uv_index?.[idx] ?? 0);
    const rawVis = raw.hourly.visibility?.[idx] ?? 10000;
    const visibilityKm = Math.round((rawVis / 1000) * 10) / 10;

    hourly.push({
      id: `hourly-${i}`,
      time: i === 0 ? 'Bây giờ' : formatVietnameseHour(hourNum),
      fullTime: `${hourNum}:00`,
      iconName: icon.name,
      iconColor: icon.color,
      temp,
      feelsLike,
      humidity,
      pop,
      rain,
      windSpeed,
      windDirection: windDir,
      windDirectionText: getWindDirectionText(windDir),
      uvIndex,
      visibility: visibilityKm,
      condition: getWeatherDescription(weatherCode),
    });
  }

  // 2. Map 10 ngày tiếp theo (kèm 24 giờ thực tế của riêng từng ngày)
  const daily: DailyData[] = [];
  const totalDays = raw.daily?.time?.length || 0;
  const remainingDays = totalDays - todayIndex;
  const daysCount = Math.min(10, remainingDays > 0 ? remainingDays : totalDays);

  for (let i = 0; i < daysCount; i++) {
    const dailyRawIdx = todayIndex + i;
    const dateStr = raw.daily.time[dailyRawIdx];
    const date = new Date(dateStr);
    const dayName = i === 0 ? 'Hôm nay' : daysOfWeek[date.getDay()];
    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const weatherCode = raw.daily.weathercode?.[dailyRawIdx] ?? 0;
    const icon = getWeatherIcon(weatherCode, true);
    const low = Math.round(raw.daily.temperature_2m_min?.[dailyRawIdx] ?? 22);
    const high = Math.round(raw.daily.temperature_2m_max?.[dailyRawIdx] ?? 30);
    const feelsLikeMax = Math.round(raw.daily.apparent_temperature_max?.[dailyRawIdx] ?? high);
    const pop = Math.round(raw.daily.precipitation_probability_max?.[dailyRawIdx] ?? 0);
    const precipitation = Math.round((raw.daily.precipitation_sum?.[dailyRawIdx] ?? 0) * 10) / 10;
    const uvMax = Math.round(raw.daily.uv_index_max?.[dailyRawIdx] ?? 5);
    const windSpeedMax = Math.round(raw.daily.wind_speed_10m_max?.[dailyRawIdx] ?? 12);
    const windDir = Math.round(raw.daily.wind_direction_10m_dominant?.[dailyRawIdx] ?? 0);

    const sunriseDate = raw.daily.sunrise?.[dailyRawIdx] ? new Date(raw.daily.sunrise[dailyRawIdx]) : null;
    const sunsetDate = raw.daily.sunset?.[dailyRawIdx] ? new Date(raw.daily.sunset[dailyRawIdx]) : null;

    // Trích xuất 24 giờ thực tế của riêng ngày này từ raw.hourly
    const dayHourly: HourlyData[] = [];
    if (raw.hourly?.time) {
      for (let hIdx = 0; hIdx < raw.hourly.time.length; hIdx++) {
        if (raw.hourly.time[hIdx].startsWith(dateStr)) {
          const tStr = raw.hourly.time[hIdx];
          const d = new Date(tStr);
          const hNum = d.getHours();
          const isDayTime = hNum >= 6 && hNum < 18;
          const wCode = raw.hourly.weathercode?.[hIdx] ?? 0;
          const hIcon = getWeatherIcon(wCode, isDayTime);
          dayHourly.push({
            id: `hourly-${dateStr}-${hNum}`,
            time: (i === 0 && hNum === currentHour) ? 'Bây giờ' : formatVietnameseHour(hNum),
            fullTime: `${hNum}:00`,
            iconName: hIcon.name,
            iconColor: hIcon.color,
            temp: Math.round(raw.hourly.temperature_2m?.[hIdx] ?? 25),
            feelsLike: Math.round(raw.hourly.apparent_temperature?.[hIdx] ?? 25),
            humidity: Math.round(raw.hourly.relative_humidity_2m?.[hIdx] ?? 70),
            pop: Math.round(raw.hourly.precipitation_probability?.[hIdx] ?? 0),
            rain: Math.round((raw.hourly.precipitation?.[hIdx] ?? 0) * 10) / 10,
            windSpeed: Math.round(raw.hourly.wind_speed_10m?.[hIdx] ?? 10),
            windDirection: Math.round(raw.hourly.wind_direction_10m?.[hIdx] ?? 0),
            windDirectionText: getWindDirectionText(Math.round(raw.hourly.wind_direction_10m?.[hIdx] ?? 0)),
            uvIndex: Math.round(raw.hourly.uv_index?.[hIdx] ?? 0),
            visibility: Math.round(((raw.hourly.visibility?.[hIdx] ?? 10000) / 1000) * 10) / 10,
            condition: getWeatherDescription(wCode),
          });
        }
      }
    }

    daily.push({
      id: `daily-${i}`,
      day: dayName,
      dateStr: formattedDate,
      iconName: icon.name,
      iconColor: icon.color,
      condition: getWeatherDescription(weatherCode),
      low,
      high,
      feelsLikeMax,
      pop,
      precipitation,
      uvIndex: uvMax,
      uvText: getUVCategory(uvMax),
      windSpeed: windSpeedMax,
      windDirection: windDir,
      windDirectionText: getWindDirectionText(windDir),
      sunrise: formatTime(sunriseDate),
      sunset: formatTime(sunsetDate),
      hourly: dayHourly.length > 0 ? dayHourly : undefined,
    });
  }

  // 3. Map Current Weather
  const currentTemp = Math.round(raw.current_weather?.temperature ?? (hourly[0]?.temp || 28));
  const currentCode = raw.current_weather?.weathercode ?? (hourly[0]?.condition ? 0 : 2);
  const isDay = raw.current_weather?.is_day === 1;
  const currentIcon = getWeatherIcon(currentCode, isDay);
  const feelsLike = hourly[0]?.feelsLike ?? currentTemp;
  const humidity = hourly[0]?.humidity ?? 75;
  const windSpeed = Math.round(raw.current_weather?.windspeed ?? 12);
  const windDirection = Math.round(raw.current_weather?.winddirection ?? 0);
  const uvIndex = daily[0]?.uvIndex ?? 5;
  const precipitation = daily[0]?.precipitation ?? 0;
  const visibility = hourly[0]?.visibility ?? 10;

  const lastUpdated = `${now.getHours().toString().padStart(2, '0')}:${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  return {
    current: {
      city: cityName,
      temp: currentTemp,
      condition: getWeatherDescription(currentCode),
      high: daily[0]?.high ?? currentTemp + 4,
      low: daily[0]?.low ?? currentTemp - 4,
      feelsLike,
      humidity,
      windSpeed,
      windDirection,
      windDirectionText: getWindDirectionText(windDirection),
      uvIndex,
      uvText: getUVCategory(uvIndex),
      precipitation,
      visibility,
      isDay,
      weatherCode: currentCode,
      iconName: currentIcon.name,
      iconColor: currentIcon.color,
      sunrise: daily[0]?.sunrise || '05:48',
      sunset: daily[0]?.sunset || '17:42',
      pressure: Math.round((raw.hourly as any)?.surface_pressure?.[startIndex] ?? 1013),
    },
    hourly,
    daily,
    yesterday,
    lastUpdated,
  };
};
