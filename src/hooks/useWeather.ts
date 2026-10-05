import { useState, useEffect, useCallback, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { fetchRawWeather, fetchCityName } from '../services/weatherApi';
import { mapWeatherData } from '../utils/weatherMapper';
import { cacheService } from '../services/cacheService';
import { WeatherData } from '../types/weather';

const DEFAULT_COORDS = {
  lat: 21.0285,
  lon: 105.8542,
  cityName: 'Hà Nội',
};

export const useWeather = () => {
  // KHỞI TẠO TỨC THÌ: Lấy dữ liệu từ cache ngay lập tức khi mở app
  // Người dùng KHÔNG phải đợi spinner quay hay màn hình trắng!
  const [weatherData, setWeatherData] = useState<WeatherData>(() => cacheService.getCachedData());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);

  const fetchWeatherBackground = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsUpdating(true);
    }

    try {
      let lat = DEFAULT_COORDS.lat;
      let lon = DEFAULT_COORDS.lon;
      let cityName = DEFAULT_COORDS.cityName;

      // Cố gắng lấy vị trí GPS thực tế trong thời gian ngắn (3.5 giây)
      // Nếu không được hoặc từ chối quyền, fallback mượt mà về Hà Nội
      try {
        const position = await new Promise<any>((resolve, reject) => {
          Geolocation.getCurrentPosition(
            pos => resolve(pos),
            err => reject(err),
            { enableHighAccuracy: false, timeout: 3500, maximumAge: 60000 }
          );
        });

        if (position && position.coords) {
          lat = position.coords.latitude;
          lon = position.coords.longitude;
          cityName = await fetchCityName(lat, lon);
        }
      } catch (locErr) {
        // Fallback nhẹ nhàng về toạ độ mặc định
        lat = DEFAULT_COORDS.lat;
        lon = DEFAULT_COORDS.lon;
        cityName = DEFAULT_COORDS.cityName;
      }

      // Gọi API Open-Meteo ngầm
      const rawData = await fetchRawWeather(lat, lon);
      const mapped = mapWeatherData(rawData, cityName);

      if (isMounted.current) {
        setWeatherData(mapped);
        cacheService.setCachedData(mapped);
        setError(null);
      }
    } catch (err: any) {
      console.warn('Lỗi khi cập nhật thời tiết:', err?.message || err);
      // Giữ nguyên dữ liệu cache hiện tại để người dùng vẫn xem bình thường
      if (isMounted.current) {
        setError('Không thể cập nhật thời tiết mới nhất');
      }
    } finally {
      if (isMounted.current) {
        setIsUpdating(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    // Chạy fetch ngầm ngay khi app mount
    fetchWeatherBackground(false);

    return () => {
      isMounted.current = false;
    };
  }, [fetchWeatherBackground]);

  const refreshWeather = useCallback(() => {
    return fetchWeatherBackground(true);
  }, [fetchWeatherBackground]);

  return {
    weatherData,
    isUpdating,
    isRefreshing,
    error,
    refreshWeather,
  };
};
