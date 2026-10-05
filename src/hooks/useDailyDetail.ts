import { useState, useEffect, useMemo } from 'react';
import { Dimensions, LayoutChangeEvent } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useWeather } from './useWeather';
import { DailyData, HourlyData, ScrubberDayItem } from '../types';
import { calculateDynamicDegreeScale, calculateHermiteCurve } from '../utils/chartMath';

export const CHART_HEIGHT = 160;
export const RAIN_CHART_HEIGHT = 120;

export const useDailyDetail = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { weatherData } = useWeather();
  const [tempType, setTempType] = useState<'actual' | 'feelsLike'>('actual');

  const now = useMemo(() => new Date(), []);
  const currentDayOfWeek = now.getDay(); // 0: Chủ Nhật, 1: Thứ Hai ...

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    return route.params?.dayIndex !== undefined
      ? (currentDayOfWeek + route.params.dayIndex) % 7
      : currentDayOfWeek;
  });

  useEffect(() => {
    if (route.params?.dayIndex !== undefined) {
      setSelectedIndex((currentDayOfWeek + route.params.dayIndex) % 7);
    }
  }, [route.params?.dayIndex, currentDayOfWeek]);

  const dailyList: DailyData[] = weatherData?.daily || [];
  const hourlyList: HourlyData[] = weatherData?.hourly || [];

  const screenWidth = Dimensions.get('window').width;
  const [chartWidth, setChartWidth] = useState<number>(Math.max(200, screenWidth - 108));

  const handleChartLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width - 36; // trừ phần nhãn nhiệt độ bên phải
    if (w > 100 && Math.abs(w - chartWidth) > 2) {
      setChartWidth(w);
    }
  };

  // Xây dựng 7 ngày trong tuần bắt đầu từ Chủ Nhật (chuẩn iOS: CN 4, T2 5, T3 6...)
  const scrubberDays: ScrubberDayItem[] = useMemo(() => {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDayOfWeek);

    return Array.from({ length: 7 }).map((_, idx) => {
      const targetDate = new Date(startOfWeek);
      targetDate.setDate(startOfWeek.getDate() + idx);
      const dayCodes = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const fullDays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const targetFormatted = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;

      // Lấy dữ liệu thực tế khớp ngày
      let dayData = dailyList.find(d => d.dateStr === targetFormatted);
      if (!dayData && weatherData?.yesterday && weatherData.yesterday.dateStr === targetFormatted) {
        dayData = weatherData.yesterday;
      }
      if (!dayData) {
        const dayOffset = Math.max(0, idx - currentDayOfWeek);
        dayData = dailyList[dayOffset] || dailyList[0];
      }

      return {
        index: idx,
        isToday: idx === currentDayOfWeek,
        dayCode: dayCodes[targetDate.getDay()],
        dateNum: targetDate.getDate(),
        fullDateStr: `${fullDays[targetDate.getDay()]}, ngày ${targetDate.getDate()} tháng ${targetDate.getMonth() + 1}, ${targetDate.getFullYear()}`,
        dayData,
      };
    });
  }, [now, currentDayOfWeek, dailyList, weatherData?.yesterday]);

  const currentScrubberItem = scrubberDays[selectedIndex] || scrubberDays[0];
  const selectedDay: DailyData = currentScrubberItem.dayData;

  // Lấy danh sách 24 giờ thực tế từ API của ngày đang chọn
  const dayHourlyData: HourlyData[] = useMemo(() => {
    return selectedDay?.hourly && selectedDay.hourly.length === 24
      ? selectedDay.hourly
      : hourlyList;
  }, [selectedDay, hourlyList]);

  // 1. Tính toán 24 điểm nhiệt độ thực tế
  const hourlyTemps = useMemo(() => {
    if (!selectedDay) return [];
    return Array.from({ length: 24 }).map((_, h) => {
      const item = dayHourlyData[h];
      if (item) {
        return tempType === 'actual' ? item.temp : item.feelsLike;
      }
      const factor = (1 - Math.cos(((h - 5) / 24) * 2 * Math.PI)) / 2;
      return Math.round(selectedDay.low + factor * (selectedDay.high - selectedDay.low));
    });
  }, [dayHourlyData, selectedDay, tempType]);

  // Tự động tính toán thang nhiệt độ linh hoạt theo thực tế
  const dynamicScale = useMemo(() => {
    return calculateDynamicDegreeScale(hourlyTemps);
  }, [hourlyTemps]);

  // Tạo đường cong mềm mịn bằng nội suy Hermite Cosine giữa 24 mốc giờ
  const { points: interpolatedPoints, maxPoint: maxPt, minPoint: minPt } = useMemo(() => {
    return calculateHermiteCurve(
      hourlyTemps,
      dynamicScale.degMin,
      dynamicScale.degMax,
      dynamicScale.degRange,
      chartWidth,
      CHART_HEIGHT
    );
  }, [hourlyTemps, dynamicScale, chartWidth]);

  // 2. Tính toán 24 cột xác suất mưa thực tế
  const hourlyPops = useMemo(() => {
    if (!selectedDay) return [];
    return Array.from({ length: 24 }).map((_, h) => {
      const item = dayHourlyData[h];
      if (item && item.pop !== undefined) {
        return item.pop;
      }
      return selectedDay.pop;
    });
  }, [dayHourlyData, selectedDay]);

  // 3. Tính toán vị trí thời gian hiện tại để kẻ vạch dóng thẳng xuống
  const isToday = currentScrubberItem.isToday;
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentHourDecimal = currentHour + currentMinute / 60;
  const currentX = (currentHourDecimal / 24) * chartWidth;

  const currentTempActual = weatherData?.current?.temp ?? hourlyTemps[currentHour] ?? selectedDay?.high ?? 0;
  const currentFeelsLikeActual = weatherData?.current?.feelsLike ?? currentTempActual;
  const activeCurrentTemp = tempType === 'actual' ? currentTempActual : currentFeelsLikeActual;

  const currentClampedTemp = Math.max(dynamicScale.degMin, Math.min(dynamicScale.degMax, activeCurrentTemp));
  const currentY = ((dynamicScale.degMax - currentClampedTemp) / dynamicScale.degRange) * CHART_HEIGHT;

  const currentPopActual = hourlyPops[currentHour] ?? selectedDay?.pop ?? 0;
  const currentRainY = RAIN_CHART_HEIGHT - Math.max(3, (currentPopActual / 100) * RAIN_CHART_HEIGHT);

  const clockMinuteStr = currentMinute.toString().padStart(2, '0');
  const clockVietnameseStr = currentHour < 12
    ? `${currentHour === 0 ? 12 : currentHour}:${clockMinuteStr} SA`
    : `${currentHour === 12 ? 12 : currentHour - 12}:${clockMinuteStr} CH`;

  // 4. Dự báo tự động theo thông tin thời tiết thực
  const currentTemp = weatherData?.current?.temp ?? selectedDay?.high ?? 0;
  const feelsLike = weatherData?.current?.feelsLike ?? selectedDay?.feelsLikeMax ?? 0;
  const diff = feelsLike - currentTemp;
  const feelsLikeSentence = diff < 0
    ? `Gió đang khiến bạn cảm thấy mát hơn, khoảng ${feelsLike}°.`
    : diff > 0
    ? `Độ ẩm khiến bạn cảm thấy oi bức hơn, khoảng ${feelsLike}°.`
    : `Nhiệt độ cảm nhận tương đương nhiệt độ thực tế (${feelsLike}°).`;

  const rainSum = selectedDay?.precipitation ?? 0;
  const rainSentence = rainSum > 0
    ? `Tổng lượng mưa dự kiến trong ngày khoảng ${rainSum} mm.`
    : `Không có mưa dự kiến trong ngày.`;

  const forecastNarrative = selectedDay
    ? `Bây giờ: ${currentTemp}° và ${selectedDay.condition.toLowerCase()}. ${feelsLikeSentence} Phạm vi nhiệt độ hôm nay là từ ${selectedDay.low}° đến ${selectedDay.high}°, và cảm nhận từ ${selectedDay.low}° đến ${selectedDay.feelsLikeMax}°. ${rainSentence} Mặt trời lặn lúc ${selectedDay.sunset}, mọc lúc ${selectedDay.sunrise}.`
    : '';

  // 5. So sánh hàng ngày dựa trên dữ liệu hôm qua thực tế
  const yesterdayData = weatherData?.yesterday;
  const yesterdayLow = yesterdayData ? yesterdayData.low : Math.max(0, (selectedDay?.low ?? 0) - 1);
  const yesterdayHigh = yesterdayData ? yesterdayData.high : (selectedDay?.high ?? 0) - 1;
  const highDiff = selectedDay ? selectedDay.high - yesterdayHigh : 0;

  let compareNotice = 'Nhiệt độ cao nhất hôm nay tương tự như hôm qua.';
  if (highDiff > 1) {
    compareNotice = `Nhiệt độ cao nhất hôm nay cao hơn hôm qua khoảng ${highDiff}°.`;
  } else if (highDiff < -1) {
    compareNotice = `Nhiệt độ cao nhất hôm nay thấp hơn hôm qua khoảng ${Math.abs(highDiff)}°.`;
  }

  return {
    selectedIndex,
    setSelectedIndex,
    scrubberDays,
    currentScrubberItem,
    selectedDay,
    tempType,
    setTempType,
    chartWidth,
    setChartWidth,
    handleChartLayout,
    dynamicScale,
    gridDegrees: dynamicScale.gridDegrees,
    interpolatedPoints,
    maxPt,
    minPt,
    dayHourlyData,
    hourlyPops,
    isToday,
    currentX,
    currentY,
    currentRainY,
    activeCurrentTemp,
    currentPopActual,
    clockVietnameseStr,
    forecastNarrative,
    yesterdayData,
    yesterdayLow,
    yesterdayHigh,
    compareNotice,
    highDiff,
    currentTemp,
    weatherData,
    navigation,
  };
};
