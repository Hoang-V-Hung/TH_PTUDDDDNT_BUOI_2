import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { searchLocations } from '../services/weatherApi';
import { cacheService } from '../services/cacheService';
import { useWeather } from './useWeather';
import { LocationItem } from '../types';

export const POPULAR_LOCATIONS: LocationItem[] = [
  { id: 'hn', name: 'Hà Nội', admin1: 'Hà Nội', country: 'Việt Nam', countryCode: 'VN', lat: 21.0285, lon: 105.8542 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', admin1: 'Thành phố Hồ Chí Minh', country: 'Việt Nam', countryCode: 'VN', lat: 10.823, lon: 106.63 },
  { id: 'dn', name: 'Đà Nẵng', admin1: 'Đà Nẵng', country: 'Việt Nam', countryCode: 'VN', lat: 16.068, lon: 108.212 },
  { id: 'hp', name: 'Hải Phòng', admin1: 'Hải Phòng', country: 'Việt Nam', countryCode: 'VN', lat: 20.845, lon: 106.688 },
  { id: 'ct', name: 'Cần Thơ', admin1: 'Cần Thơ', country: 'Việt Nam', countryCode: 'VN', lat: 10.045, lon: 105.747 },
  { id: 'nt', name: 'Nha Trang', admin1: 'Khánh Hòa', country: 'Việt Nam', countryCode: 'VN', lat: 12.245, lon: 109.194 },
  { id: 'dl', name: 'Đà Lạt', admin1: 'Lâm Đồng', country: 'Việt Nam', countryCode: 'VN', lat: 11.940, lon: 108.458 },
  { id: 'hue', name: 'Huế', admin1: 'Thừa Thiên Huế', country: 'Việt Nam', countryCode: 'VN', lat: 16.464, lon: 107.591 },
  { id: 'vt', name: 'Vũng Tàu', admin1: 'Bà Rịa - Vũng Tàu', country: 'Việt Nam', countryCode: 'VN', lat: 10.346, lon: 107.084 },
  { id: 'tokyo', name: 'Tokyo', admin1: 'Tokyo', country: 'Nhật Bản', countryCode: 'JP', lat: 35.6895, lon: 139.6917 },
  { id: 'paris', name: 'Paris', admin1: 'Île-de-France', country: 'Pháp', countryCode: 'FR', lat: 48.8566, lon: 2.3522 },
  { id: 'ny', name: 'New York', admin1: 'New York', country: 'Hoa Kỳ', countryCode: 'US', lat: 40.7128, lon: -74.006 },
];

export const useLocationSearch = () => {
  const navigation = useNavigation<any>();
  const { currentLocation } = useWeather();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentLocations, setRecentLocations] = useState<LocationItem[]>(() => cacheService.getRecentLocations());

  const searchTimer = useRef<any>(null);

  // Debounce tìm kiếm khi gõ
  const handleQueryChange = useCallback((text: string) => {
    setSearchQuery(text);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchLocations(trimmed);
        setSearchResults(results);
      } catch (err) {
        console.warn('Lỗi tìm kiếm:', err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, []);

  const handleSelectLocation = useCallback((loc: LocationItem) => {
    cacheService.setCurrentLocation(loc);
    setRecentLocations(cacheService.getRecentLocations());
    cacheService.fetchAndApplyWeather(loc).catch((err) => {
      console.warn('Lỗi tải thời tiết cho địa điểm:', err);
    });
    navigation.goBack();
  }, [navigation]);

  const handleSelectGps = useCallback(() => {
    const gpsLoc: LocationItem = {
      id: 'gps-current',
      name: 'Vị trí hiện tại',
      lat: 21.0285,
      lon: 105.8542,
      isGps: true,
    };
    cacheService.setCurrentLocation(gpsLoc);
    cacheService.fetchAndApplyWeather(gpsLoc).catch((err) => {
      console.warn('Lỗi tải thời tiết GPS:', err);
    });
    navigation.goBack();
  }, [navigation]);

  const handleClearRecent = useCallback(() => {
    cacheService.clearRecentLocations();
    setRecentLocations([]);
  }, []);

  const clearQuery = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  return {
    searchQuery,
    setSearchQuery: handleQueryChange,
    searchResults,
    isLoading,
    recentLocations,
    popularLocations: POPULAR_LOCATIONS,
    currentLocation,
    handleSelectLocation,
    handleSelectGps,
    handleClearRecent,
    clearQuery,
    navigation,
  };
};
