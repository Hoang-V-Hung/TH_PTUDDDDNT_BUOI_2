import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  low: number;
  high: number;
  minGlobal?: number; // Nhiệt độ thấp nhất trong khoảng so sánh (mặc định 18)
  maxGlobal?: number; // Nhiệt độ cao nhất trong khoảng so sánh (mặc định 38)
  currentTemp?: number; // Nếu có (ngày hôm nay), hiện chấm chỉ vị trí nhiệt độ hiện tại
}

interface ColorStop {
  temp: number;
  r: number;
  g: number;
  b: number;
}

// Bảng ánh xạ màu sắc nhiệt độ thực tế chuẩn Apple Weather:
// Dưới 0°: Xanh dương lạnh
// 0° - 12°: Xanh lơ / Sky Blue
// 12° - 18°: Xanh bạc hà / Teal mát mẻ
// 18° - 23°: Vàng hổ phách dịu
// 23° - 28°: Cam hổ phách ấm áp
// 28° - 33°: Cam sáng
// 33° - 38°: Cam đậm / Đỏ cam nóng
// Trên 38°: Đỏ tươi gắt
const THERMAL_STOPS: ColorStop[] = [
  { temp: -15, r: 29,  g: 78,  b: 216 }, // Deep Blue
  { temp: 0,   r: 59,  g: 130, b: 246 }, // Blue
  { temp: 8,   r: 56,  g: 189, b: 248 }, // Sky Blue
  { temp: 15,  r: 45,  g: 212, b: 191 }, // Teal / Mint
  { temp: 20,  r: 250, g: 204, b: 21  }, // Golden Yellow
  { temp: 24,  r: 245, g: 158, b: 11  }, // Amber
  { temp: 28,  r: 249, g: 115, b: 22  }, // Warm Orange
  { temp: 33,  r: 234, g: 88,  b: 12  }, // Deep Orange
  { temp: 40,  r: 239, g: 68,  b: 68  }, // Red
];

export const getThermalColor = (temp: number): string => {
  if (temp <= THERMAL_STOPS[0].temp) {
    const { r, g, b } = THERMAL_STOPS[0];
    return `rgb(${r}, ${g}, ${b})`;
  }
  const last = THERMAL_STOPS[THERMAL_STOPS.length - 1];
  if (temp >= last.temp) {
    return `rgb(${last.r}, ${last.g}, ${last.b})`;
  }

  for (let i = 0; i < THERMAL_STOPS.length - 1; i++) {
    const s1 = THERMAL_STOPS[i];
    const s2 = THERMAL_STOPS[i + 1];
    if (temp >= s1.temp && temp <= s2.temp) {
      const t = (temp - s1.temp) / (s2.temp - s1.temp);
      const r = Math.round(s1.r + (s2.r - s1.r) * t);
      const g = Math.round(s1.g + (s2.g - s1.g) * t);
      const b = Math.round(s1.b + (s2.b - s1.b) * t);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
  return '#F59E0B';
};

export const getThermalGradient = (low: number, high: number): string[] => {
  const startColor = getThermalColor(low);
  const endColor = getThermalColor(high);
  if (high - low >= 4) {
    const midColor = getThermalColor((low + high) / 2);
    return [startColor, midColor, endColor];
  }
  return [startColor, endColor];
};

export const TemperatureBar: React.FC<Props> = ({
  low,
  high,
  minGlobal,
  maxGlobal,
  currentTemp,
}) => {
  const effMin = minGlobal !== undefined ? minGlobal : low;
  const effMax = maxGlobal !== undefined ? maxGlobal : high;
  const totalRange = Math.max(1, effMax - effMin);

  const leftPercent = Math.max(0, Math.min(100, ((low - effMin) / totalRange) * 100));
  const rawRightPercent = Math.max(0, Math.min(100, ((high - effMin) / totalRange) * 100));
  const widthPercent = Math.max(8, Math.min(100 - leftPercent, rawRightPercent - leftPercent));

  let currentDotPercent: number | null = null;
  if (currentTemp !== undefined) {
    const clampedCurrent = Math.max(effMin, Math.min(effMax, currentTemp));
    currentDotPercent = Math.max(0, Math.min(100, ((clampedCurrent - effMin) / totalRange) * 100));
  }

  // Tạo dải màu gradient chính xác theo thang nhiệt độ thực tế của ngày đó
  const barColors = getThermalGradient(low, high);

  return (
    <View style={styles.container}>
      {/* Background Track */}
      <View style={styles.track} />

      {/* Filled Gradient Bar (Màu chính xác theo nhiệt độ thực tế) */}
      <View
        style={[
          styles.rangeBarWrapper,
          {
            left: `${leftPercent}%`,
            width: `${widthPercent}%`,
          },
        ]}
      >
        <LinearGradient
          colors={barColors}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientBar}
        />
      </View>

      {/* Current Temperature Indicator Dot */}
      {currentDotPercent !== null && (
        <View
          style={[
            styles.dot,
            {
              left: `${currentDotPercent}%`,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 6,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 4.5,
    width: '100%',
    borderRadius: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
  },
  rangeBarWrapper: {
    position: 'absolute',
    height: 4.5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  gradientBar: {
    flex: 1,
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    marginLeft: -4,
    top: -1.75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
});
