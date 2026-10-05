import React, { ReactNode } from 'react';
import { StyleSheet, ViewStyle, StatusBar, View, StyleProp } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const BackgroundView: React.FC<Props> = ({ children, style }) => {
  const { colors, weatherType } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />

      {/* 1. Lớp nền Gradient khí quyển đa điểm theo thời gian & thời tiết (Base Atmospheric Gradient) */}
      <LinearGradient
        colors={colors.gradientColors}
        start={{ x: 0.5, y: 0.0 }}
        end={{ x: 0.5, y: 1.0 }}
        style={[styles.gradient, style]}
      >
        {/* 2. Ánh sáng tán xạ thiên văn (Celestial / Sun / Moon Ambient Glow) */}
        <LinearGradient
          colors={[colors.ambientGlowColor, 'transparent']}
          start={{ x: 0.5, y: 0.0 }}
          end={{ x: 0.5, y: 0.45 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* 3. Lớp tán xạ nhiệt độ đường chân trời (Horizon Thermal Glow nếu nắng nóng hoặc lạnh buốt) */}
        {colors.horizonGlowColor && (
          <LinearGradient
            colors={['transparent', colors.horizonGlowColor]}
            start={{ x: 0.5, y: 0.65 }}
            end={{ x: 0.5, y: 1.0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

        {/* 4. Lớp viền mờ khí quyển cho dông bão hoặc mưa rào (Atmospheric Storm Vignette) */}
        {(weatherType === 'rain' || weatherType === 'thunderstorm') && (
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.20)', 'transparent', 'rgba(15, 23, 42, 0.35)']}
            start={{ x: 0.5, y: 0.0 }}
            end={{ x: 0.5, y: 1.0 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}

        {children}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
});
