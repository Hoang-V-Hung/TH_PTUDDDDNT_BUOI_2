import Geolocation from '@react-native-community/geolocation';
import { WeatherData, LocationItem } from '../types';
import { generateDefaultWeatherData } from '../utils/defaultData';
import { fetchRawWeather, fetchCityName } from './weatherApi';
import { mapWeatherData } from '../utils/weatherMapper';

export const DEFAULT_LOCATION: LocationItem = {
  id: 'hanoi-default',
  name: 'Hà Nội',
  admin1: 'Hà Nội',
  country: 'Việt Nam',
  countryCode: 'VN',
  lat: 21.0285,
  lon: 105.8542,
  isGps: false,
};

class CacheService {
  private static instance: CacheService;
  private memoryCache: WeatherData | null = null;
  private lastFetchedTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 phút

  private currentLocation: LocationItem = DEFAULT_LOCATION;
  private recentLocations: LocationItem[] = [
    {
      id: 1566083,
      name: 'TP. Hồ Chí Minh',
      admin1: 'Thành phố Hồ Chí Minh',
      country: 'Việt Nam',
      countryCode: 'VN',
      lat: 10.823,
      lon: 106.63,
    },
    {
      id: 1583992,
      name: 'Đà Nẵng',
      admin1: 'Đà Nẵng',
      country: 'Việt Nam',
      countryCode: 'VN',
      lat: 16.068,
      lon: 108.212,
    },
  ];

  private constructor() {
    this.memoryCache = generateDefaultWeatherData();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public getCachedData(): WeatherData {
    if (!this.memoryCache) {
      this.memoryCache = generateDefaultWeatherData();
    }
    return this.memoryCache;
  }

  private listeners: Set<(data: WeatherData) => void> = new Set();
  private locationListeners: Set<(loc: LocationItem) => void> = new Set();

  public subscribe(listener: (data: WeatherData) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public subscribeLocation(listener: (loc: LocationItem) => void): () => void {
    this.locationListeners.add(listener);
    return () => {
      this.locationListeners.delete(listener);
    };
  }

  public setCachedData(data: WeatherData): void {
    this.memoryCache = data;
    this.lastFetchedTimestamp = Date.now();
    this.listeners.forEach((fn) => {
      try {
        fn(data);
      } catch (err) {
        console.warn('Cache subscription error:', err);
      }
    });
  }

  public updateCityName(cityName: string): void {
    if (!cityName) return;
    if (this.memoryCache && this.memoryCache.current) {
      this.memoryCache = {
        ...this.memoryCache,
        current: {
          ...this.memoryCache.current,
          city: cityName,
        },
      };
      this.listeners.forEach((fn) => {
        try {
          fn(this.memoryCache!);
        } catch (err) {
          console.warn('Cache subscription error:', err);
        }
      });
    }
  }

  public getCurrentLocation(): LocationItem {
    return this.currentLocation;
  }

  public setCurrentLocation(loc: LocationItem): void {
    this.currentLocation = loc;
    this.addRecentLocation(loc);
    this.updateCityName(loc.name);
    this.locationListeners.forEach((fn) => {
      try {
        fn(loc);
      } catch (err) {
        console.warn('Location subscription error:', err);
      }
    });
  }

  public getRecentLocations(): LocationItem[] {
    return this.recentLocations;
  }

  public addRecentLocation(loc: LocationItem): void {
    if (!loc || !loc.name) return;
    const filtered = this.recentLocations.filter(
      (item) => item.name.toLowerCase() !== loc.name.toLowerCase() && item.id !== loc.id
    );
    this.recentLocations = [loc, ...filtered].slice(0, 8);
  }

  public clearRecentLocations(): void {
    this.recentLocations = [];
  }

  /**
   * Tải thời tiết và lưu cache độc lập với vòng đời React Component
   */
  public async fetchAndApplyWeather(targetLoc?: LocationItem): Promise<WeatherData> {
    const loc = targetLoc || this.currentLocation;
    let lat = loc.lat;
    let lon = loc.lon;
    let cityName = loc.name;

    if (loc.isGps) {
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
          const updatedLoc: LocationItem = { ...loc, name: cityName, lat, lon };
          this.setCurrentLocation(updatedLoc);
        }
      } catch {
        // Giữ toạ độ fallback
      }
    }

    try {
      const rawData = await fetchRawWeather(lat, lon);
      const mapped = mapWeatherData(rawData, cityName);
      this.setCachedData(mapped);
      return mapped;
    } catch (error) {
      console.warn('Lỗi tải thời tiết cho địa điểm:', error);
      throw error;
    }
  }

  public isStale(): boolean {
    if (!this.lastFetchedTimestamp) return true;
    return Date.now() - this.lastFetchedTimestamp > this.CACHE_TTL_MS;
  }
}

export const cacheService = CacheService.getInstance();

