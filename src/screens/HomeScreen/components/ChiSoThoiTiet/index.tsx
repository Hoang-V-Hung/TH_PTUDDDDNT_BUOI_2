import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { CurrentData } from '../../../../types';
import { GlassCard } from '../../../../components/GlassCard';
import { useTheme } from '../../../../contexts/ThemeContext';
import { calculateDewPoint, calculateMoonPhase } from '../../../../utils';

interface Props {
  data: CurrentData;
  onSelectMetric?: (metricKey: string) => void;
}

export const ChiSoThoiTiet: React.FC<Props> = ({ data, onSelectMetric }) => {
  const { colors } = useTheme();

  // Điểm sương ước lượng từ dữ liệu thực tế
  const dewPoint = calculateDewPoint(data.temp, data.humidity);

  // Tính toán chu kỳ thiên văn mặt trăng thực tế từ ngày hiện tại
  const moonPhase = calculateMoonPhase();

  const realPressure = data.pressure || 1013;
  const realSunset = data.sunset || '17:42';
  const realSunrise = data.sunrise || '05:48';

  return (
    <View style={styles.container}>
      {/* Hàng 1: CẢM NHẬN & CHỈ SỐ UV */}
      <View style={styles.row}>
        {/* CẢM NHẬN */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('feelsLike')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="thermometer-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>CẢM NHẬN</Text>
            </View>
            <Text style={styles.valueBig}>{data.feelsLike}°</Text>
            <Text style={styles.descText}>
              {data.feelsLike < data.temp
                ? 'Gió đang khiến bạn cảm thấy mát mẻ hơn.'
                : 'Độ ẩm khiến bạn cảm giác oi nóng hơn.'}
            </Text>
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.colGap} />

        {/* CHỈ SỐ UV */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('uv')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="sunny-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>CHỈ SỐ UV</Text>
            </View>
            <View>
              <Text style={styles.valueBig}>{data.uvIndex}</Text>
              <Text style={styles.valueSub}>{data.uvText}</Text>
            </View>
            {/* Rainbow UV Bar */}
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
                  { left: `${Math.min(95, Math.max(5, (data.uvIndex / 11) * 100))}%` },
                ]}
              />
            </View>
            <Text style={styles.descText}>
              Tránh nắng gắt giờ cao điểm.
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Hàng 2: GIÓ (Wide Card with Compass) */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMetric && onSelectMetric('wind')}
      >
        <GlassCard style={[styles.card, styles.wideCard]}>
          <View style={styles.header}>
            <Icon name="navigate-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
            <Text style={styles.headerTitle}>GIÓ</Text>
          </View>
          <View style={styles.windBody}>
            {/* Stats Left */}
            <View style={styles.windStatsCol}>
              <View style={styles.windStatRow}>
                <Text style={styles.windStatLabel}>Tốc độ gió</Text>
                <Text style={styles.windStatVal}>
                  {data.windSpeed} km/h
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
              <View style={styles.windStatRow}>
                <Text style={styles.windStatLabel}>Gió giật</Text>
                <Text style={styles.windStatVal}>
                  {Math.round(data.windSpeed * 1.4)} km/h
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.borderColor }]} />
              <View style={styles.windStatRow}>
                <Text style={styles.windStatLabel}>Hướng gió</Text>
                <Text style={styles.windStatVal}>
                  {data.windDirection}° {data.windDirectionText}
                </Text>
              </View>
            </View>

            {/* Compass Right */}
            <View style={styles.compassWrapper}>
              <View style={[styles.compassCircle, { borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Text style={[styles.compassDirectionLabel, styles.compassLabelN]}>B</Text>
                <Text style={[styles.compassDirectionLabel, styles.compassLabelS]}>N</Text>
                <Text style={[styles.compassDirectionLabel, styles.compassLabelW]}>T</Text>
                <Text style={[styles.compassDirectionLabel, styles.compassLabelE]}>Đ</Text>
                <View style={styles.compassCenter}>
                  <Text style={styles.compassCenterSpeed}>{data.windSpeed}</Text>
                  <Text style={styles.compassCenterUnit}>km/h</Text>
                </View>
                <Icon
                  name="arrow-down"
                  size={16}
                  color="#38BDF8"
                  style={[
                    styles.compassNeedle,
                    { transform: [{ rotate: `${data.windDirection}deg` }] },
                  ]}
                />
              </View>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Hàng 3: MẶT TRỜI LẶN & LƯỢNG MƯA */}
      <View style={styles.row}>
        {/* MẶT TRỜI LẶN */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('sunset')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="partly-sunny-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>MẶT TRỜI LẶN</Text>
            </View>
            <Text style={styles.valueBig}>{realSunset}</Text>
            {/* Sun Arc visual */}
            <View style={styles.sunArcWrapper}>
              <View style={styles.sunArcLine} />
              <View style={styles.sunDot} />
            </View>
            <Text style={styles.descText}>
              Mặt trời mọc: {realSunrise}
            </Text>
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.colGap} />

        {/* LƯỢNG MƯA */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('precipitation')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="water-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>LƯỢNG MƯA</Text>
            </View>
            <View>
              <Text style={styles.valueBig}>
                {data.precipitation || 0} mm
              </Text>
              <Text style={styles.valueSub}>
                trong 24 giờ qua
              </Text>
            </View>
            <Text style={styles.descText}>
              {data.precipitation > 0 ? 'Có mưa đo được trong ngày.' : 'Không ghi nhận mưa trong ngày.'}
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Hàng 4: TẦM NHÌN & ĐỘ ẨM */}
      <View style={styles.row}>
        {/* TẦM NHÌN */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('visibility')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="eye-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>TẦM NHÌN</Text>
            </View>
            <Text style={styles.valueBig}>
              {data.visibility} km
            </Text>
            <Text style={styles.descText}>
              {data.visibility >= 10 ? 'Tầm nhìn xa hoàn hảo và thông thoáng.' : 'Tầm nhìn có mây mờ che phủ.'}
            </Text>
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.colGap} />

        {/* ĐỘ ẨM */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('humidity')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="water" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>ĐỘ ẨM</Text>
            </View>
            <Text style={styles.valueBig}>
              {data.humidity}%
            </Text>
            <Text style={styles.descText}>
              Điểm sương hiện tại là {dewPoint}°.
            </Text>
          </GlassCard>
        </TouchableOpacity>
      </View>

      {/* Hàng 5: PHA MẶT TRĂNG & ÁP SUẤT */}
      <View style={styles.row}>
        {/* PHA MẶT TRĂNG */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('moon')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="moon-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle} numberOfLines={1}>
                {moonPhase.phaseTitle}
              </Text>
            </View>
            <View style={styles.moonRow}>
              <View style={styles.moonStats}>
                <Text style={styles.moonStatText}>
                  Chiếu sáng: <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{moonPhase.illumination}%</Text>
                </Text>
                <Text style={[styles.moonStatText, { marginTop: 4 }]}>
                  Trăng tròn: {moonPhase.daysToFull} ngày
                </Text>
                <Text style={[styles.moonStatText, { marginTop: 4 }]}>
                  Chu kỳ: ngày thứ {Math.round(moonPhase.currentCycleDay)}
                </Text>
              </View>
              {/* Moon sphere */}
              <View style={styles.moonSphere}>
                <View
                  style={[
                    styles.moonShadow,
                    { width: `${Math.max(10, 100 - moonPhase.illumination)}%` },
                  ]}
                />
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>

        <View style={styles.colGap} />

        {/* ÁP SUẤT */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.colHalf}
          onPress={() => onSelectMetric && onSelectMetric('pressure')}
        >
          <GlassCard style={styles.card}>
            <View style={styles.header}>
              <Icon name="speedometer-outline" size={15} color="rgba(255, 255, 255, 0.75)" style={styles.headerIcon} />
              <Text style={styles.headerTitle}>ÁP SUẤT</Text>
            </View>
            <Text style={styles.valueBig}>
              {realPressure} <Text style={{ fontSize: 16 }}>hPa</Text>
            </Text>
            {/* Pressure gauge */}
            <View style={styles.pressureGaugeWrapper}>
              <View style={[styles.pressureArc, { borderColor: 'rgba(255, 255, 255, 0.25)' }]}>
                <Icon
                  name="arrow-down"
                  size={14}
                  color="#FFFFFF"
                  style={[
                    styles.pressureArrow,
                    {
                      transform: [
                        { rotate: `${Math.max(-45, Math.min(45, (realPressure - 1013) * 3))}deg` },
                      ],
                    },
                  ]}
                />
              </View>
              <View style={styles.pressureLabels}>
                <Text style={styles.pressureLabelText}>Thấp</Text>
                <Text style={styles.pressureLabelText}>Cao</Text>
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  colHalf: {
    flex: 1,
  },
  colGap: {
    width: 12,
  },
  card: {
    padding: 16,
    minHeight: 152,
    justifyContent: 'space-between',
  },
  wideCard: {
    marginBottom: 12,
    minHeight: 164,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerIcon: {
    marginRight: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  valueBig: {
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -0.5,
    marginVertical: 2,
    color: '#FFFFFF',
  },
  valueSub: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  descText: {
    fontSize: 12.5,
    fontWeight: '400',
    lineHeight: 16,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  uvBarWrapper: {
    position: 'relative',
    height: 4,
    marginVertical: 6,
    justifyContent: 'center',
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
    top: -2,
    marginLeft: -4,
  },
  windBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  windStatsCol: {
    flex: 1,
    paddingRight: 12,
  },
  windStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  divider: {
    height: 0.5,
    width: '100%',
  },
  windStatLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.80)',
  },
  windStatVal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compassWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compassCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  compassDirectionLabel: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  compassLabelN: { top: 3 },
  compassLabelS: { bottom: 3 },
  compassLabelW: { left: 4 },
  compassLabelE: { right: 4 },
  compassCenter: {
    alignItems: 'center',
  },
  compassCenterSpeed: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  compassCenterUnit: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  compassNeedle: {
    position: 'absolute',
  },
  sunArcWrapper: {
    height: 28,
    position: 'relative',
    marginVertical: 4,
    justifyContent: 'center',
  },
  sunArcLine: {
    height: 24,
    borderTopWidth: 2,
    borderColor: '#FBBF24',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sunDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FBBF24',
    top: 0,
    left: '60%',
  },
  moonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  moonStats: {
    flex: 1,
  },
  moonStatText: {
    fontSize: 11.5,
    color: 'rgba(255, 255, 255, 0.80)',
  },
  moonSphere: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#94A3B8',
    overflow: 'hidden',
    position: 'relative',
  },
  moonShadow: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1E293B',
    borderRadius: 22,
  },
  pressureGaugeWrapper: {
    marginTop: 6,
  },
  pressureArc: {
    height: 24,
    borderTopWidth: 2,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressureArrow: {
    marginTop: 2,
  },
  pressureLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  pressureLabelText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.65)',
  },
});
