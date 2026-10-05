import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../../../contexts/ThemeContext';
import { TemperatureBar } from '../../../../../../components/TemperatureBar';

interface Props {
  day: string;
  iconName: string;
  iconColor: string;
  low: number;
  high: number;
  pop?: number;
  isToday?: boolean;
  currentTemp?: number;
  minGlobal?: number;
  maxGlobal?: number;
  isLast?: boolean;
  onPress?: () => void;
}

export const ThoiTietTheoNgayItem: React.FC<Props> = ({
  day,
  iconName,
  iconColor,
  low,
  high,
  pop = 0,
  isToday = false,
  currentTemp,
  minGlobal,
  maxGlobal,
  isLast = false,
  onPress,
}) => {
  const { colors } = useTheme();

  let finalColor = iconColor;
  if (iconName === 'sunny' || iconName === 'partly-sunny') {
    finalColor = '#FBBF24';
  } else if (iconName === 'rainy' || iconName === 'rainy-outline' || iconName === 'water') {
    finalColor = '#38BDF8';
  } else if (iconName === 'cloudy' || iconName === 'cloud') {
    finalColor = '#FFFFFF';
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.row,
        !isLast && [styles.bottomBorder, { borderBottomColor: colors.borderColor }],
      ]}
    >
      {/* Ngày trong tuần */}
      <View style={styles.dayCol}>
        <Text
          style={[
            styles.dayText,
            { fontWeight: isToday ? '700' : '500' },
          ]}
          numberOfLines={1}
        >
          {day}
        </Text>
      </View>

      {/* Icon thời tiết + % mưa */}
      <View style={styles.iconCol}>
        <Icon name={iconName} size={24} color={finalColor} />
        {pop > 15 && (
          <Text style={styles.popText}>{pop}%</Text>
        )}
      </View>

      {/* Dải nhiệt độ Min - Max kiểu iOS */}
      <View style={styles.tempRangeCol}>
        <Text style={styles.tempLowText}>{low}°</Text>
        <View style={styles.barWrapper}>
          <TemperatureBar
            low={low}
            high={high}
            minGlobal={minGlobal}
            maxGlobal={maxGlobal}
            currentTemp={isToday ? currentTemp : undefined}
          />
        </View>
        <Text style={styles.tempHighText}>{high}°</Text>
      </View>

      {/* Chevron icon nhẹ nhàng */}
      <Icon
        name="chevron-forward"
        size={14}
        color="rgba(255, 255, 255, 0.45)"
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  bottomBorder: {
    borderBottomWidth: 0.5,
  },
  dayCol: {
    width: 72,
  },
  dayText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  iconCol: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 1,
  },
  tempRangeCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  tempLowText: {
    fontSize: 16,
    fontWeight: '500',
    width: 30,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.70)',
  },
  tempHighText: {
    fontSize: 16,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  barWrapper: {
    flex: 1,
    paddingHorizontal: 6,
  },
  chevron: {
    marginLeft: 4,
  },
});
