import { WeatherData } from '../types/weather';
import { generateDefaultWeatherData } from '../utils/defaultData';

class CacheService {
  private static instance: CacheService;
  private memoryCache: WeatherData | null = null;
  private lastFetchedTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 phút

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

  public subscribe(listener: (data: WeatherData) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
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

  public isStale(): boolean {
    if (!this.lastFetchedTimestamp) return true;
    return Date.now() - this.lastFetchedTimestamp > this.CACHE_TTL_MS;
  }
}

export const cacheService = CacheService.getInstance();
