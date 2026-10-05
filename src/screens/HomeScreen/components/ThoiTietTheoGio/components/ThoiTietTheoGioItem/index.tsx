import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../../../../contexts/ThemeContext';

interface Props {
  time: string;
  iconName: string;
  iconColor: string;
  temp: number;
  pop?: number;
  isFirst?: boolean;
  onPress?: () => void;
}

export const ThoiTietTheoGioItem: React.FC<Props> = ({
  time,
  iconName,
  iconColor,
  temp,
  pop = 0,
  isFirst = false,
  onPress,
}) => {
  const { colors } = useTheme();

  // Đảm bảo icon có màu sắc rực rỡ, chuẩn Apple Weather
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
        styles.container,
        isFirst && styles.firstItem,
      ]}
    >
      <Text style={[styles.time, isFirst && styles.firstItemTime]}>
        {time}
      </Text>

      <View style={styles.iconContainer}>
        <Icon name={iconName} size={28} color={finalColor} />
        {pop > 0 ? (
          <Text style={styles.popText}>
            {pop}%
          </Text>
        ) : (
          <View style={styles.popPlaceholder} />
        )}
      </View>

      <Text style={styles.temp}>{temp}°</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
    minWidth: 58,
  },
  firstItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  time: {
    fontSize: 13.5,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
  },
  firstItemTime: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 4,
    height: 48,
    justifyContent: 'center',
  },
  popText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginTop: 2,
  },
  popPlaceholder: {
    height: 14,
  },
  temp: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2,
  },
});
