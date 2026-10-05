import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { CurrentData } from '../../../../types';

interface Props {
  data: CurrentData;
  isUpdating?: boolean;
  lastUpdated?: string;
  showCity?: boolean;
}

export const ThoiTietHienTai: React.FC<Props> = ({
  data,
  isUpdating = false,
  lastUpdated,
  showCity = false,
}) => {
  const { city, temp, condition, high, low } = data;

  return (
    <View style={styles.container}>
      {/* Tên thành phố nếu cần */}
      {showCity && (
        <Text style={styles.cityText}>
          {city === 'Hà Nội' ? 'Hà Nội' : city}
        </Text>
      )}

      {/* Nhiệt độ lớn phong cách iOS Weather */}
      <Text style={styles.tempText}>{temp}°</Text>

      {/* Trạng thái thời tiết */}
      <Text style={styles.conditionText}>{condition}</Text>

      {/* Nhiệt độ cao nhất & thấp nhất */}
      <View style={styles.subStatsRow}>
        <Text style={styles.subStatText}>
          C:{high}°  T:{low}°
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 104,
    paddingHorizontal: 20,
  },
  locationTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationTagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  cityText: {
    fontSize: 34,
    fontWeight: '300',
    letterSpacing: 0.5,
    marginBottom: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  tempText: {
    fontSize: 94,
    fontWeight: '100',
    lineHeight: 102,
    letterSpacing: -2,
    marginVertical: 0,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  conditionText: {
    fontSize: 22,
    fontWeight: '400',
    marginTop: 2,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subStatText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  updateStatusRow: {
    marginTop: 8,
    height: 20,
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  lastUpdatedText: {
    fontSize: 11.5,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
