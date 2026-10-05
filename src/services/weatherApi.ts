import axios from 'axios';
import { RawWeatherData, LocationItem, GeocodingResult } from '../types';

const WEATHER_API_BASE = 'https://api.open-meteo.com/v1/forecast';
const REVERSE_GEO_BASE = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

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

const GEOCODING_API_BASE = 'https://geocoding-api.open-meteo.com/v1/search';

export const searchLocations = async (query: string): Promise<LocationItem[]> => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const response = await axios.get(GEOCODING_API_BASE, {
      params: {
        name: trimmed,
        count: 10,
        language: 'vi',
        format: 'json',
      },
      timeout: 6000,
    });

    const results: GeocodingResult[] = response.data?.results || [];
    return results.map((item) => ({
      id: item.id,
      name: item.name,
      admin1: item.admin1,
      country: item.country,
      countryCode: item.country_code,
      lat: item.latitude,
      lon: item.longitude,
    }));
  } catch (error) {
    console.warn('Lỗi khi tìm kiếm địa điểm:', error);
    return [];
  }
};

