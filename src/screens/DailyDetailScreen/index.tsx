import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';
import { BackgroundView } from '../../components/BackgroundView';
import { TemperatureBar } from '../../components/TemperatureBar';
import { useDailyDetail, CHART_HEIGHT, RAIN_CHART_HEIGHT } from '../../hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DailyDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const {
    selectedIndex,
    setSelectedIndex,
    scrubberDays,
    currentScrubberItem,
    selectedDay,
    tempType,
    setTempType,
    chartWidth,
    handleChartLayout,
    gridDegrees,
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
    yesterdayLow,
    yesterdayHigh,
    compareNotice,
    highDiff,
    weatherData,
    navigation,
  } = useDailyDetail();

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
  const safeTop = Math.max(insets.top, statusBarHeight) + 8;
  const safeBottom = Math.max(insets.bottom, 16) + 30;

  if (!selectedDay) return null;

  return (
    <BackgroundView>
      <View style={styles.modalContainer}>
        {/* Top Header: "☁️ Điều kiện thời tiết" + Nút đóng tròn (X) chuẩn iOS */}
        <View style={[styles.topHeader, { paddingTop: safeTop }]}>
          <View style={styles.headerTitleRow}>
            <Icon name="cloud" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.headerTitle}>Điều kiện thời tiết</Text>
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
          {/* Weekly Calendar Scrubber: CN 4, T2 5, T3 6, T4 7, T5 8, T6 9, T7 10 */}
          <View style={styles.scrubberContainer}>
            <View style={styles.scrubberRow}>
              {scrubberDays.map((item) => {
                const isSelected = item.index === selectedIndex;
                return (
                  <TouchableOpacity
                    key={item.index}
                    activeOpacity={0.7}
                    onPress={() => setSelectedIndex(item.index)}
                    style={styles.scrubberCol}
                  >
                    <Text style={[styles.scrubberDayText, isSelected && styles.scrubberDayTextActive]}>
                      {item.dayCode}
                    </Text>
                    <View style={[styles.scrubberDatePill, isSelected && styles.scrubberDatePillActive]}>
                      <Text style={[styles.scrubberDateText, isSelected && styles.scrubberDateTextActive]}>
                        {item.dateNum}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.fullDateLabel}>{currentScrubberItem.fullDateStr}</Text>
          </View>

          {/* Selected Day Hero Overview: 27° ☁️, C:27° T:22° */}
          <View style={styles.heroOverviewRow}>
            <View>
              <View style={styles.tempWithIconRow}>
                <Text style={styles.bigTempText}>
                  {tempType === 'actual' ? selectedDay.high : selectedDay.feelsLikeMax}°
                </Text>
                <Icon
                  name={selectedDay.iconName === 'cloudy' ? 'cloud' : selectedDay.iconName}
                  size={34}
                  color={selectedDay.iconName === 'sunny' ? '#FBBF24' : '#FFFFFF'}
                  style={{ marginLeft: 8 }}
                />
              </View>
              <Text style={styles.highLowText}>
                C:{selectedDay.high}°  T:{selectedDay.low}°
              </Text>
            </View>
          </View>

          {/* Biểu đồ đường nhiệt độ theo giờ chuẩn Apple Weather */}
          <View style={[styles.chartContainer, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
            {/* Dãy icon thời tiết trên đỉnh biểu đồ */}
            <View style={styles.chartIconsRow}>
              {dayHourlyData.slice(0, 11).map((h, i) => (
                <Icon
                  key={i}
                  name={h.iconName === 'cloudy' ? 'cloud' : h.iconName}
                  size={16}
                  color={h.iconName === 'sunny' ? '#FBBF24' : '#FFFFFF'}
                  style={{ opacity: 0.9 }}
                />
              ))}
            </View>

            {/* Vùng vẽ đồ thị nhiệt độ */}
            <View
              style={styles.chartAreaWrapper}
              onLayout={handleChartLayout}
            >
              {/* Lưới ngang hiển thị các mức nhiệt độ thực tế */}
              <View style={styles.gridLinesContainer}>
                {gridDegrees.map((deg) => (
                  <View key={deg} style={styles.gridLineRow}>
                    <View style={styles.dashedLine} />
                    <Text style={styles.gridDegreeText}>{deg}°</Text>
                  </View>
                ))}
              </View>

              {/* Lưới dọc tại các mốc: 12 SA, 6 SA, 12 CH, 6 CH */}
              <View style={styles.verticalGridLines}>
                <View style={styles.verticalLine} />
                <View style={styles.verticalLine} />
                <View style={styles.verticalLine} />
                <View style={styles.verticalLine} />
              </View>

              {/* Vạch dóng thẳng xuống tại thời gian hiện tại */}
              {isToday && (
                <View style={[styles.currentTimelineVertical, { left: currentX }]}>
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.9)', 'rgba(56, 189, 248, 0.8)', 'rgba(255, 255, 255, 0.4)']}
                    style={{ flex: 1, width: 1.5 }}
                  />
                </View>
              )}

              {/* Vùng dải màu gradient cam hổ phách dưới đường cong */}
              <View style={[styles.plotLayer, { width: chartWidth }]}>
                {interpolatedPoints.slice(0, -1).map((p1, idx) => {
                  const p2 = interpolatedPoints[idx + 1];
                  const colWidth = Math.max(1, p2.x - p1.x) + 0.6;
                  const colHeight = Math.max(0, CHART_HEIGHT - Math.min(p1.y, p2.y));
                  const isPast = isToday && p1.x < currentX;

                  return (
                    <LinearGradient
                      key={`fill-${idx}`}
                      colors={
                        isPast
                          ? ['rgba(245, 158, 11, 0.25)', 'rgba(0, 0, 0, 0.20)', 'transparent']
                          : ['rgba(245, 158, 11, 0.55)', 'rgba(245, 158, 11, 0.12)', 'transparent']
                      }
                      start={{ x: 0.5, y: 0.0 }}
                      end={{ x: 0.5, y: 1.0 }}
                      style={{
                        position: 'absolute',
                        left: p1.x,
                        bottom: 0,
                        width: colWidth,
                        height: colHeight,
                      }}
                    />
                  );
                })}

                {/* Các đoạn đường nối cong mượt mà (Quá khứ mờ nét đứt nhẹ, tương lai sáng rõ nét) */}
                {interpolatedPoints.slice(0, -1).map((p1, idx) => {
                  const p2 = interpolatedPoints[idx + 1];
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const dist = Math.hypot(dx, dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  const midX = (p1.x + p2.x) / 2;
                  const midY = (p1.y + p2.y) / 2;
                  const isPast = isToday && p1.x < currentX;

                  return (
                    <View
                      key={`seg-${idx}`}
                      style={{
                        position: 'absolute',
                        left: midX - dist / 2,
                        top: midY - 1.25,
                        width: dist,
                        height: 2.5,
                        backgroundColor: isPast ? 'rgba(245, 158, 11, 0.45)' : '#F59E0B',
                        borderRadius: 1.5,
                        transform: [{ rotate: `${angle}deg` }],
                      }}
                    />
                  );
                })}

                {/* Điểm cực đại (C) */}
                <View style={[styles.markerWrapper, { left: maxPt.x - 10, top: Math.max(2, maxPt.y - 24) }]}>
                  <Text style={styles.markerText}>C</Text>
                  <View style={styles.chartDot} />
                </View>

                {/* Điểm cực tiểu (T) */}
                <View style={[styles.markerWrapper, { left: minPt.x - 10, top: Math.min(CHART_HEIGHT - 24, minPt.y + 2) }]}>
                  <View style={styles.chartDot} />
                  <Text style={styles.markerText}>T</Text>
                </View>

                {/* Điểm và nhãn nhiệt độ thực tế tại vạch dóng thời gian hiện tại */}
                {isToday && (
                  <>
                    <View
                      style={[
                        styles.currentTempBadge,
                        {
                          left: Math.max(0, Math.min(chartWidth - 44, currentX - 22)),
                          top: Math.max(2, currentY - 28),
                        },
                      ]}
                    >
                      <Text style={styles.currentTempBadgeText}>{activeCurrentTemp}°</Text>
                    </View>
                    <View
                      style={[
                        styles.currentDotWrapper,
                        {
                          left: currentX - 5,
                          top: currentY - 5,
                        },
                      ]}
                    />
                  </>
                )}
              </View>
            </View>

            {/* Hàng giờ chân biểu đồ nhiệt độ kèm vạch dóng thời gian thực */}
            <View style={styles.timeAxisRow}>
              <Text style={styles.timeAxisText}>12 SA</Text>
              <Text style={styles.timeAxisText}>6 SA</Text>
              <Text style={styles.timeAxisText}>12 CH</Text>
              <Text style={styles.timeAxisText}>6 CH</Text>

              {/* Nhãn thời gian hiện tại dóng thẳng từ trên xuống */}
              {isToday && (
                <View
                  style={[
                    styles.currentTimePill,
                    { left: Math.max(0, Math.min(chartWidth - 58, currentX - 29)) },
                  ]}
                >
                  <Text style={styles.currentTimePillText}>{clockVietnameseStr}</Text>
                </View>
              )}
            </View>

            {/* Nút chuyển đổi [ Thực tế ] | [ Cảm nhận ] */}
            <View style={[styles.segmentedControl, { backgroundColor: 'rgba(0, 0, 0, 0.25)' }]}>
              <TouchableOpacity
                style={[styles.segmentBtn, tempType === 'actual' && styles.segmentBtnActive]}
                onPress={() => setTempType('actual')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, tempType === 'actual' && styles.segmentTextActive]}>
                  Thực tế
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentBtn, tempType === 'feelsLike' && styles.segmentBtnActive]}
                onPress={() => setTempType('feelsLike')}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, tempType === 'feelsLike' && styles.segmentTextActive]}>
                  Cảm nhận
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.segmentDesc}>
              {tempType === 'actual' ? 'Nhiệt độ thực tế.' : 'Nhiệt độ cảm nhận.'}
            </Text>
          </View>

          {/* Biểu đồ Khả năng có mưa kèm hàng giờ và vạch dóng thời gian hiện tại */}
          <View style={styles.rainSection}>
            <Text style={styles.rainSectionTitle}>Khả năng có mưa</Text>
            <Text style={styles.rainSectionSubtitle}>
              Khả năng có mưa vào hôm nay: {selectedDay.pop}%
            </Text>
            <View style={[styles.rainChartBox, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              {/* Khung vẽ các cột mưa và lưới */}
              <View style={styles.rainPlotArea}>
                {/* Lưới ngang phần trăm 100%, 80%, 60%, 40%, 20%, 0% */}
                <View style={styles.rainGridLines}>
                  {[100, 80, 60, 40, 20, 0].map((val) => (
                    <View key={val} style={styles.rainGridRow}>
                      <View style={styles.dashedLine} />
                      <Text style={styles.rainGridText}>{val}%</Text>
                    </View>
                  ))}
                </View>

                {/* Lưới dọc tại các mốc giờ 12 SA, 6 SA, 12 CH, 6 CH */}
                <View style={styles.verticalGridLines}>
                  <View style={styles.verticalLine} />
                  <View style={styles.verticalLine} />
                  <View style={styles.verticalLine} />
                  <View style={styles.verticalLine} />
                </View>

                {/* Vạch dóng thẳng xuống tại thời gian hiện tại trên biểu đồ mưa */}
                {isToday && (
                  <View style={[styles.currentTimelineVertical, { left: currentX }]}>
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.9)', 'rgba(56, 189, 248, 0.8)', 'rgba(255, 255, 255, 0.4)']}
                      style={{ flex: 1, width: 1.5 }}
                    />
                  </View>
                )}

                {/* 24 Cột xác suất mưa theo 24 giờ */}
                <View style={[styles.rainBarsLayer, { width: chartWidth }]}>
                  {hourlyPops.map((pop, h) => {
                    const barWidth = Math.max(4, (chartWidth / 24) * 0.65);
                    const barLeft = (h / 24) * chartWidth + ((chartWidth / 24) - barWidth) / 2;
                    const barHeight = Math.max(3, (pop / 100) * RAIN_CHART_HEIGHT);
                    const isPast = isToday && ((h + 1) / 24) * chartWidth < currentX;

                    return (
                      <View
                        key={`rain-bar-${h}`}
                        style={{
                          position: 'absolute',
                          left: barLeft,
                          bottom: 0,
                          width: barWidth,
                          height: barHeight,
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                          overflow: 'hidden',
                        }}
                      >
                        <LinearGradient
                          colors={
                            isPast
                              ? ['rgba(56, 189, 248, 0.4)', 'rgba(56, 189, 248, 0.15)']
                              : ['#38BDF8', 'rgba(56, 189, 248, 0.55)']
                          }
                          start={{ x: 0.5, y: 0.0 }}
                          end={{ x: 0.5, y: 1.0 }}
                          style={{ flex: 1 }}
                        />
                      </View>
                    );
                  })}

                  {/* Điểm và nhãn xác suất mưa thực tế tại vạch dóng thời gian hiện tại */}
                  {isToday && (
                    <>
                      <View
                        style={[
                          styles.currentRainBadge,
                          {
                            left: Math.max(0, Math.min(chartWidth - 44, currentX - 22)),
                            top: Math.max(2, currentRainY - 28),
                          },
                        ]}
                      >
                        <Text style={styles.currentRainBadgeText}>{currentPopActual}%</Text>
                      </View>
                      <View
                        style={[
                          styles.currentRainDot,
                          {
                            left: currentX - 5,
                            top: currentRainY - 5,
                          },
                        ]}
                      />
                    </>
                  )}
                </View>
              </View>

              {/* Hàng giờ bên dưới chân biểu đồ mưa chuẩn Apple Weather iOS */}
              <View style={[styles.timeAxisRow, { marginTop: 8, paddingRight: 36 }]}>
                <Text style={styles.timeAxisText}>12 SA</Text>
                <Text style={styles.timeAxisText}>6 SA</Text>
                <Text style={styles.timeAxisText}>12 CH</Text>
                <Text style={styles.timeAxisText}>6 CH</Text>

                {/* Nhãn thời gian hiện tại dóng thẳng từ trên xuống */}
                {isToday && (
                  <View
                    style={[
                      styles.currentTimePill,
                      { left: Math.max(0, Math.min(chartWidth - 58, currentX - 29)) },
                    ]}
                  >
                    <Text style={styles.currentTimePillText}>{clockVietnameseStr}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Thẻ: Dự báo thông tin thời tiết thực tế */}
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionHeaderTitle}>Dự báo</Text>
            <View style={[styles.darkCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              <Text style={styles.narrativeText}>
                {forecastNarrative}
              </Text>
            </View>
          </View>

          {/* Thẻ: So sánh hàng ngày với dữ liệu hôm qua thực tế */}
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionHeaderTitle}>So sánh hàng ngày</Text>
            <View style={[styles.darkCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              <Text style={styles.compareNoticeText}>
                {compareNotice}
              </Text>
              <View style={styles.compareRow}>
                <Text style={styles.compareDayLabel}>Hôm nay</Text>
                <Text style={styles.compareTempText}>{selectedDay.low}°</Text>
                <View style={styles.compareBarWrapper}>
                  <TemperatureBar
                    low={selectedDay.low}
                    high={selectedDay.high}
                    minGlobal={Math.min(selectedDay.low, yesterdayLow) - 2}
                    maxGlobal={Math.max(selectedDay.high, yesterdayHigh) + 2}
                    currentTemp={weatherData?.current?.temp ?? selectedDay.high}
                  />
                </View>
                <Text style={styles.compareTempText}>{selectedDay.high}°</Text>
              </View>
              <View style={[styles.compareRow, { marginTop: 14 }]}>
                <Text style={styles.compareDayLabel}>Hôm qua</Text>
                <Text style={styles.compareTempText}>{yesterdayLow}°</Text>
                <View style={styles.compareBarWrapper}>
                  <TemperatureBar
                    low={yesterdayLow}
                    high={yesterdayHigh}
                    minGlobal={Math.min(selectedDay.low, yesterdayLow) - 2}
                    maxGlobal={Math.max(selectedDay.high, yesterdayHigh) + 2}
                  />
                </View>
                <Text style={styles.compareTempText}>{yesterdayHigh}°</Text>
              </View>
            </View>
          </View>

          {/* Thẻ: Giới thiệu về Nhiệt độ cảm nhận */}
          <View style={styles.narrativeSection}>
            <Text style={styles.sectionHeaderTitle}>Giới thiệu về Nhiệt độ cảm nhận</Text>
            <View style={[styles.darkCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
              <Text style={styles.narrativeText}>
                Nhiệt độ cảm nhận biểu thị độ ẩm hoặc độ lạnh mà bạn cảm thấy và có thể khác với nhiệt độ thực tế. Nhiệt độ cảm nhận bị ảnh hưởng bởi độ ẩm, ánh nắng và gió.
              </Text>
            </View>
          </View>

          {/* 6 Thẻ Metric Dark iOS */}
          <View style={styles.metricsGrid}>
            {/* Row 1: Cảm nhận & UV */}
            <View style={styles.metricRow}>
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="thermometer-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>CẢM NHẬN</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.feelsLikeMax}°</Text>
                <Text style={styles.metricDesc}>
                  {selectedDay.feelsLikeMax < selectedDay.high
                    ? 'Gió đang khiến bạn cảm thấy mát hơn.'
                    : 'Độ ẩm khiến bạn cảm giác oi bức hơn.'}
                </Text>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="sunny-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>CHỈ SỐ UV</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.uvIndex}</Text>
                <Text style={styles.metricValueSub}>{selectedDay.uvText}</Text>
                {/* UV Gradient Bar kèm dấu chấm biểu thị chỉ số UV */}
                <View style={styles.uvBarWrapper}>
                  <LinearGradient
                    colors={['#4ADE80', '#FACC15', '#FB923C', '#EF4444', '#A855F7']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.uvBar}
                  />
                  <View
                    style={[
                      styles.uvDot,
                      { left: `${Math.min(94, Math.max(6, (selectedDay.uvIndex / 11) * 100))}%` },
                    ]}
                  />
                </View>
              </View>
            </View>

            {/* Row 2: Gió & Lượng mưa */}
            <View style={styles.metricRow}>
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="navigate-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>GIÓ</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.windSpeed} <Text style={{ fontSize: 16 }}>km/h</Text></Text>
                <Text style={styles.metricDesc}>Hướng: {selectedDay.windDirectionText}</Text>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="water-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>LƯỢNG MƯA</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.precipitation} <Text style={{ fontSize: 16 }}>mm</Text></Text>
                <Text style={styles.metricDesc}>
                  {selectedDay.precipitation > 0 ? 'Tổng lượng mưa dự kiến trong ngày.' : 'Không có mưa dự kiến trong ngày.'}
                </Text>
              </View>
            </View>

            {/* Row 3: Mặt trời & Độ ẩm */}
            <View style={styles.metricRow}>
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="moon-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>MẶT TRỜI LẶN</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.sunset}</Text>
                <Text style={styles.metricDesc}>Mặt trời mọc: {selectedDay.sunrise}</Text>
              </View>
              <View style={{ width: 12 }} />
              <View style={[styles.metricCardDark, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                <View style={styles.metricHeader}>
                  <Icon name="speedometer-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={{ marginRight: 6 }} />
                  <Text style={styles.metricTitle}>BIÊN ĐỘ NHIỆT</Text>
                </View>
                <Text style={styles.metricValueLarge}>{selectedDay.high - selectedDay.low}°</Text>
                <Text style={styles.metricDesc}>Dao động từ {selectedDay.low}° đến {selectedDay.high}°.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </BackgroundView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
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
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrubberContainer: {
    marginBottom: 20,
  },
  scrubberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scrubberCol: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40) / 7,
  },
  scrubberDayText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
    marginBottom: 6,
  },
  scrubberDayTextActive: {
    color: '#FFFFFF',
  },
  scrubberDatePill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrubberDatePillActive: {
    backgroundColor: '#38BDF8',
  },
  scrubberDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scrubberDateTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  fullDateLabel: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '500',
  },
  heroOverviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tempWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigTempText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 52,
  },
  highLowText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 2,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  chartContainer: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.8,
  },
  chartIconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
    paddingRight: 36,
  },
  chartAreaWrapper: {
    height: CHART_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
  },
  plotLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  gridLinesContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  gridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashedLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  gridDegreeText: {
    width: 32,
    textAlign: 'right',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  verticalGridLines: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 36,
  },
  verticalLine: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentTimelineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1.5,
    zIndex: 12,
  },
  currentDotWrapper: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#0F172A',
    zIndex: 25,
  },
  currentTempBadge: {
    position: 'absolute',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#F59E0B',
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTempBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentRainBadge: {
    position: 'absolute',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    zIndex: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentRainBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  currentRainDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#38BDF8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    zIndex: 25,
  },
  markerWrapper: {
    position: 'absolute',
    width: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  markerText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chartDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
  },
  timeAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingRight: 36,
    position: 'relative',
    height: 20,
    alignItems: 'center',
  },
  timeAxisText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  currentTimePill: {
    position: 'absolute',
    top: -2,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 10,
  },
  currentTimePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0F172A',
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 2,
    marginTop: 16,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  segmentText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.65)',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  segmentDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.65)',
    marginTop: 8,
  },
  rainSection: {
    marginBottom: 24,
  },
  rainSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rainSectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 12,
  },
  rainChartBox: {
    borderRadius: 20,
    padding: 16,
    position: 'relative',
    borderWidth: 0.8,
  },
  rainPlotArea: {
    height: RAIN_CHART_HEIGHT,
    position: 'relative',
  },
  rainGridLines: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'space-between',
  },
  rainGridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rainGridText: {
    width: 32,
    textAlign: 'right',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  rainBarsLayer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  narrativeSection: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  darkCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 0.8,
  },
  narrativeText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '400',
  },
  compareNoticeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    marginBottom: 14,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compareDayLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  compareTempText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    width: 32,
    textAlign: 'center',
  },
  compareBarWrapper: {
    flex: 1,
    paddingHorizontal: 8,
  },
  metricsGrid: {
    marginBottom: 20,
  },
  metricRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metricCardDark: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    minHeight: 130,
    justifyContent: 'space-between',
    borderWidth: 0.8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.6,
  },
  metricValueLarge: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  metricValueSub: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 17,
  },
  uvBarWrapper: {
    position: 'relative',
    height: 8,
    marginTop: 6,
    marginBottom: 2,
    justifyContent: 'center',
    width: '100%',
  },
  uvBar: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  uvDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#000000',
    top: 0,
    marginLeft: -4,
  },
});
