import React, { ReactNode } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
}

export const GlassCard: React.FC<Props> = ({ children, style, elevated = false }) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardBackgroundElevated : colors.cardBackground,
          borderColor: colors.borderColor,
          // Trên Android: KHÔNG dùng elevation cho view có nền kính trong suốt (rgba)
          // vì bóng đổ phần cứng của Android sẽ chiếu xuyên qua lớp nền tạo thành bóng ô vuông/khối bên trong
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.2 : 0.1,
                shadowRadius: 8,
              }
            : {
                elevation: 0,
              }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 0.8,
    overflow: 'hidden',
  },
});
