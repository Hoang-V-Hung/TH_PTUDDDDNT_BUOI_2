import React, { useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThoiTietHienTai } from './components/ThoiTietHienTai';
import { ThoiTietTheoGio } from './components/ThoiTietTheoGio';
import { ThoiTietTheoNgay } from './components/ThoiTietTheoNgay';
import { ChiSoThoiTiet } from './components/ChiSoThoiTiet';
import { useWeather } from '../../hooks/useWeather';
import { useTheme } from '../../contexts/ThemeContext';
import { BackgroundView } from '../../components/BackgroundView';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { weatherData, isUpdating, isRefreshing, refreshWeather } = useWeather();
  const { colors } = useTheme();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight);
  const safeBottom = Math.max(insets.bottom, 20) + 16;

  const scrollY = useRef(new Animated.Value(0)).current;

  // Hero fade and elastic translation
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const heroTranslateY = scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [35, 0, -25],
    extrapolate: 'clamp',
  });

  // Sticky compact header fade and subtle entrance
  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [50, 90],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const compactHeaderTranslateY = scrollY.interpolate({
    inputRange: [50, 90],
    outputRange: [-10, 0],
    extrapolate: 'clamp',
  });

  const handleSelectHour = (hourIndex: number) => {
    navigation.navigate('HourlyDetail', { hourIndex });
  };

  const handleSelectDay = (dayIndex: number) => {
    navigation.navigate('DailyDetail', { dayIndex });
  };

  const handleSelectMetric = (metricKey: string) => {
    navigation.navigate('DailyDetail', { dayIndex: 0, metricKey });
  };

  return (
    <BackgroundView>
      <View style={styles.safeArea}>
        {/* Cụm Header cố định (Apple Weather iOS) - 100% màu nền tự nhiên, không bao giờ bị đè chữ */}
        <View style={[styles.fixedHeader, { paddingTop: safeTop + 8 }]}>
          <Text style={styles.cityText}>
            {weatherData.current.city === 'Hà Nội' ? 'Hà Nội' : weatherData.current.city}
          </Text>
          <Animated.Text
            style={[
              styles.compactWeatherText,
              { opacity: compactHeaderOpacity },
            ]}
          >
            {weatherData.current.temp}° | {weatherData.current.condition}
          </Animated.Text>
        </View>

        {/* Vùng cuộn nội dung: overflow: 'hidden' giới hạn tuyệt đối không cho bất kỳ card nào vượt qua header */}
        <View style={styles.scrollArea}>
          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: safeBottom },
            ]}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            overScrollMode="always"
            bounces={true}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshWeather}
                tintColor="#FFFFFF"
                colors={[colors.accentBlue, colors.accentYellow]}
              />
            }
          >
            {/* Thời tiết hiện tại (Hero lớn) - Tự động mờ dần khi cuộn lên */}
            <Animated.View
              style={{
                opacity: heroOpacity,
                transform: [{ translateY: heroTranslateY }],
              }}
            >
              <ThoiTietHienTai
                data={weatherData.current}
                isUpdating={isUpdating}
                lastUpdated={weatherData.lastUpdated}
                showCity={false}
              />
            </Animated.View>

            {/* Dự báo 24 giờ tới (Horizontal Scroll) */}
            <ThoiTietTheoGio
              data={weatherData.hourly}
              onSelectHour={handleSelectHour}
            />

            {/* Dự báo 7 ngày tới (Apple Weather Bar) */}
            <ThoiTietTheoNgay
              data={weatherData.daily}
              currentTemp={weatherData.current.temp}
              onSelectDay={handleSelectDay}
            />

            {/* Lưới 6 chỉ số thời tiết chi tiết */}
            <ChiSoThoiTiet
              data={weatherData.current}
              onSelectMetric={handleSelectMetric}
            />
          </Animated.ScrollView>
        </View>
      </View>
    </BackgroundView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  fixedHeader: {
    alignItems: 'center',
    paddingBottom: 4,
    zIndex: 10,
  },
  cityText: {
    fontSize: 32,
    fontWeight: '300',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  compactWeatherText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    height: 18,
  },
  scrollArea: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    paddingBottom: 24,
  },
});

export default HomeScreen;
