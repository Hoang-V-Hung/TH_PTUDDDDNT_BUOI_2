import axios from 'axios';

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEO_BASE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export interface RawWeatherData {
  latitude: number;
  longitude: number;
  current_weather: {
    temperature: number;
    windspeed: number;
    winddirection: number;
    weathercode: number;
    is_day: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    relative_humidity_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weathercode: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    uv_index: number[];
    visibility: number[];
  };
  daily: {
    time: string[];
    weathercode: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_direction_10m_dominant: number[];
  };
}

export const fetchRawWeather = async (lat: number, lon: number): Promise<RawWeatherData> => {
  try {
    const response = await axios.get(WEATHER_API_BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        hourly: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'precipitation_probability',
          'precipitation',
          'weathercode',
          'wind_speed_10m',
          'wind_direction_10m',
          'uv_index',
          'visibility',
          'surface_pressure',
        ].join(','),
        daily: [
          'weathercode',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'precipitation_probability_max',
          'wind_speed_10m_max',
          'wind_direction_10m_dominant',
        ].join(','),
        forecast_days: 10,
        past_days: 1,
        timezone: 'auto',
      },
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    console.warn('Lỗi khi tải thời tiết từ Open-Meteo:', error);
    throw error;
  }
};

export const fetchCityName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await axios.get(REVERSE_GEO_BASE, {
      params: {
        latitude: lat,
        longitude: lon,
        localityLanguage: 'vi',
      },
      timeout: 4000,
    });
    const data = response.data;
    const city = data.city || data.principalSubdivision || data.locality || 'Hà Nội';
    return city;
  } catch {
    // Nếu lỗi reverse geocoding thì fallback nhẹ nhàng
    return 'Hà Nội';
  }
};
