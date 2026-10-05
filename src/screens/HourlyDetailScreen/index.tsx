import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { BackgroundView } from '../../components/BackgroundView';
import { GlassCard } from '../../components/GlassCard';
import { MetricCard } from '../../components/MetricCard';
import { useHourlyDetail } from '../../hooks';

export const HourlyDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const {
    selectedIndex,
    selectedHour,
    hourlyList,
    cityName,
    getIconColor,
    handleSelectHour,
    navigation,
  } = useHourlyDetail();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight) + 8;
  const safeBottom = Math.max(insets.bottom, 16) + 40;

  if (!selectedHour) return null;

  return (
    <BackgroundView>
      <View style={styles.safeArea}>
        {/* Top Header: "🕒 Dự báo theo giờ" + Nút đóng tròn (X) bên phải chuẩn iOS */}
        <View style={[styles.topHeader, { paddingTop: safeTop }]}>
          <View style={styles.headerTitleRow}>
            <Icon name="time-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.headerTitle}>Dự báo theo giờ</Text>
              {cityName ? <Text style={styles.headerSubtitle}>{cityName}</Text> : null}
            </View>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.toolbarBackground }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="close" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: safeBottom }]}
        >
          {/* Hero Selected Hour Header */}
          <View style={styles.heroSection}>
            <Text style={styles.heroTime}>
              {selectedHour.time === 'Bây giờ' ? 'Thời điểm hiện tại' : `Mốc thời gian: ${selectedHour.fullTime}`}
            </Text>
            <Icon
              name={selectedHour.iconName}
              size={72}
              color={getIconColor(selectedHour.iconName, selectedHour.iconColor)}
              style={styles.heroIcon}
            />
            <Text style={styles.heroTemp}>
              {selectedHour.temp}°
            </Text>
            <Text style={styles.heroCondition}>
              {selectedHour.condition}
            </Text>
            <Text style={styles.heroFeelsLike}>
              Cảm giác như {selectedHour.feelsLike}°
            </Text>
          </View>

          {/* 24-Hour Quick Selector Carousel */}
          <GlassCard style={styles.selectorCard}>
            <Text style={styles.cardHeaderTitle}>
              CHỌN MỐC GIỜ KHÁC
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyCarousel}
            >
              {hourlyList.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <TouchableOpacity
                    key={item.id || idx.toString()}
                    activeOpacity={0.7}
                    onPress={() => handleSelectHour(idx)}
                    style={[
                      styles.selectorItem,
                      isSelected && styles.selectorItemSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectorTime,
                        isSelected && styles.selectorTimeSelected,
                      ]}
                    >
                      {item.time}
                    </Text>
                    <Icon
                      name={item.iconName}
                      size={24}
                      color={getIconColor(item.iconName, item.iconColor)}
                    />
                    <Text
                      style={[
                        styles.selectorTemp,
                        isSelected && styles.selectorTempSelected,
                      ]}
                    >
                      {item.temp}°
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </GlassCard>

          {/* Detailed Metrics Grid for Selected Hour */}
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>
              CHỈ SỐ CHI TIẾT TẠI {selectedHour.time.toUpperCase()}
            </Text>

            <View style={styles.metricRow}>
              <MetricCard
                icon="rainy-outline"
                iconColor="#38BDF8"
                title="Khả năng mưa"
                value={`${selectedHour.pop}%`}
                subtitle={
                  selectedHour.pop > 50
                    ? 'Khả năng có mưa rào rất cao.'
                    : selectedHour.pop > 20
                    ? 'Có thể xuất hiện mưa rải rác.'
                    : 'Ít hoặc không có khả năng mưa.'
                }
              />
              <View style={styles.gap} />
              <MetricCard
                icon="water-outline"
                iconColor="#38BDF8"
                title="Lượng mưa"
                value={`${selectedHour.rain}`}
                unit="mm"
                subtitle="Lượng mưa đo được trong giờ này."
              />
            </View>

            <View style={styles.metricRow}>
              <MetricCard
                icon="navigate-outline"
                iconColor="#4ADE80"
                title="Tốc độ gió"
                value={`${selectedHour.windSpeed}`}
                unit="km/h"
                subtitle={`Hướng: ${selectedHour.windDirectionText}`}
              />
              <View style={styles.gap} />
              <MetricCard
                icon="speedometer-outline"
                iconColor="#38BDF8"
                title="Độ ẩm"
                value={`${selectedHour.humidity}%`}
                subtitle="Độ ẩm không khí tương đối."
              />
            </View>

            <View style={styles.metricRow}>
              <MetricCard
                icon="sunny-outline"
                iconColor="#FBBF24"
                title="Chỉ số UV"
                value={`${selectedHour.uvIndex}`}
                subtitle={
                  selectedHour.uvIndex >= 6
                    ? 'Cường độ UV mạnh, cần chống nắng.'
                    : 'Mức độ bức xạ an toàn.'
                }
              />
              <View style={styles.gap} />
              <MetricCard
                icon="eye-outline"
                iconColor="#38BDF8"
                title="Tầm nhìn"
                value={`${selectedHour.visibility}`}
                unit="km"
                subtitle="Tầm nhìn thông thoáng."
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </BackgroundView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  heroTime: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
  },
  heroIcon: {
    marginVertical: 4,
  },
  heroTemp: {
    fontSize: 64,
    fontWeight: '200',
    lineHeight: 70,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  heroCondition: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroFeelsLike: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 4,
  },
  selectorCard: {
    marginHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.0,
    paddingHorizontal: 14,
    marginBottom: 8,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  hourlyCarousel: {
    paddingHorizontal: 10,
  },
  selectorItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginRight: 6,
    minWidth: 54,
  },
  selectorItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  selectorTime: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.80)',
    marginBottom: 4,
  },
  selectorTimeSelected: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectorTemp: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.90)',
    marginTop: 4,
  },
  selectorTempSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricsContainer: {
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
    color: 'rgba(255, 255, 255, 0.70)',
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  gap: {
    width: 12,
  },
});
