import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ThoiTietTheoGioItem } from './components/ThoiTietTheoGioItem';
import { useTheme } from '../../../../contexts/ThemeContext';
import { HourlyData } from '../../../../types';
import { GlassCard } from '../../../../components/GlassCard';

interface Props {
  data: HourlyData[];
  onSelectHour?: (hourIndex: number) => void;
}

export const ThoiTietTheoGio: React.FC<Props> = ({ data, onSelectHour }) => {
  const { colors } = useTheme();

  return (
    <GlassCard style={styles.card}>
      {/* Header Description (Apple Weather iOS) */}
      <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
        <Text style={styles.summaryText}>
          Dự báo 24 giờ
        </Text>
      </View>

      {/* Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.map((item, index) => (
          <ThoiTietTheoGioItem
            key={item.id || index.toString()}
            time={item.time}
            iconName={item.iconName}
            iconColor={item.iconColor}
            temp={item.temp}
            pop={item.pop}
            isFirst={index === 0}
            onPress={() => onSelectHour && onSelectHour(index)}
          />
        ))}
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
});
