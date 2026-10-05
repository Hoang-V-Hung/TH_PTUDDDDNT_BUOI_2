import { useState, useEffect, useCallback, useRef } from 'react';
import Geolocation from '@react-native-community/geolocation';
import { fetchRawWeather, fetchCityName } from '../services/weatherApi';
import { mapWeatherData } from '../utils/weatherMapper';
import { cacheService } from '../services/cacheService';
import { WeatherData, LocationItem } from '../types';

export const useWeather = () => {
  // KHỞI TẠO TỨC THÌ: Lấy dữ liệu từ cache ngay lập tức khi mở app
  const [weatherData, setWeatherData] = useState<WeatherData>(() => cacheService.getCachedData());
  const [currentLocation, setCurrentLocation] = useState<LocationItem>(() => cacheService.getCurrentLocation());
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef<boolean>(true);

  // Lắng nghe thay đổi từ cache và location trên toàn app
  useEffect(() => {
    isMounted.current = true;

    const unsubscribeCache = cacheService.subscribe((data) => {
      if (isMounted.current) {
        setWeatherData(data);
      }
    });

    const unsubscribeLocation = cacheService.subscribeLocation((loc) => {
      if (isMounted.current) {
        setCurrentLocation(loc);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribeCache();
      unsubscribeLocation();
    };
  }, []);

  // Chọn một địa điểm cụ thể (từ tìm kiếm hoặc danh sách phổ biến)
  const selectLocation = useCallback(async (loc: LocationItem) => {
    setIsUpdating(true);
    setCurrentLocation(loc);
    cacheService.setCurrentLocation(loc); // Đổi tên thành phố ngay lập tức trên UI

    try {
      await cacheService.fetchAndApplyWeather(loc);
      if (isMounted.current) setError(null);
    } catch (err: any) {
      console.warn('Lỗi khi tải thời tiết địa điểm:', err?.message || err);
      if (isMounted.current) setError('Không thể cập nhật thời tiết mới nhất');
    } finally {
      if (isMounted.current) setIsUpdating(false);
    }
  }, []);

  // Trở lại vị trí GPS hiện tại của thiết bị
  const resetToGpsLocation = useCallback(async () => {
    const gpsLoc: LocationItem = {
      id: 'gps-current',
      name: 'Vị trí hiện tại',
      lat: 21.0285,
      lon: 105.8542,
      isGps: true,
    };
    await selectLocation(gpsLoc);
  }, [selectLocation]);

  useEffect(() => {
    // Tự động fetch ngầm thời tiết cho vị trí hiện tại khi app khởi chạy
    cacheService.fetchAndApplyWeather().catch((err) => {
      console.warn('Lỗi khởi tạo thời tiết:', err);
    });
  }, []);

  const refreshWeather = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await cacheService.fetchAndApplyWeather();
      if (isMounted.current) setError(null);
    } catch {
      if (isMounted.current) setError('Không thể cập nhật thời tiết');
    } finally {
      if (isMounted.current) setIsRefreshing(false);
    }
  }, []);

  return {
    weatherData,
    currentLocation,
    isCustomLocation: !currentLocation.isGps && currentLocation.id !== 'hanoi-default',
    isUpdating,
    isRefreshing,
    error,
    refreshWeather,
    selectLocation,
    resetToGpsLocation,
  };
};

