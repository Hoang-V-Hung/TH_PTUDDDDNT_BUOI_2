import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ThoiTietTheoNgayItem } from './components/ThoiTietTheoNgayItem';
import { useTheme } from '../../../../contexts/ThemeContext';
import { DailyData } from '../../../../types';
import { GlassCard } from '../../../../components/GlassCard';

interface Props {
  data: DailyData[];
  currentTemp?: number;
  onSelectDay?: (dayIndex: number) => void;
}

export const ThoiTietTheoNgay: React.FC<Props> = ({ data, currentTemp, onSelectDay }) => {
  const { colors } = useTheme();

  // Tính toán nhiệt độ min và max trên toàn bộ danh sách ngày để dải đo chính xác tuyệt đối theo dữ liệu thực
  const allLows = data.map(d => d.low);
  const allHighs = data.map(d => d.high);
  if (currentTemp !== undefined) {
    allLows.push(currentTemp);
    allHighs.push(currentTemp);
  }
  const minGlobal = allLows.length > 0 ? Math.min(...allLows) : 18;
  const maxGlobal = allHighs.length > 0 ? Math.max(...allHighs) : 32;

  return (
    <GlassCard style={styles.card}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Icon name="calendar-outline" size={14} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
        <Text style={styles.headerTitle}>
          DỰ BÁO 7 NGÀY
        </Text>
      </View>

      {/* Danh sách 7 ngày */}
      <View style={styles.list}>
        {data.map((item, index) => (
          <ThoiTietTheoNgayItem
            key={item.id || index.toString()}
            day={item.day}
            iconName={item.iconName}
            iconColor={item.iconColor}
            low={item.low}
            high={item.high}
            pop={item.pop}
            isToday={index === 0}
            currentTemp={currentTemp}
            minGlobal={minGlobal}
            maxGlobal={maxGlobal}
            isLast={index === data.length - 1}
            onPress={() => onSelectDay && onSelectDay(index)}
          />
        ))}
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 14,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    marginBottom: 4,
  },
  headerIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  list: {
    paddingHorizontal: 16,
  },
});
