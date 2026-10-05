import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { GlassCard } from './GlassCard';

interface Props {
  icon: string;
  iconColor?: string;
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  bottomElement?: React.ReactNode;
  onPress?: () => void;
  style?: any;
}

export const MetricCard: React.FC<Props> = ({
  icon,
  iconColor,
  title,
  value,
  unit,
  subtitle,
  bottomElement,
  onPress,
  style,
}) => {
  const { colors } = useTheme();

  const CardContent = (
    <GlassCard style={[styles.card, style]}>
      {/* Header: Icon + Title */}
      <View style={styles.header}>
        <Icon
          name={icon}
          size={16}
          color={iconColor || 'rgba(255, 255, 255, 0.75)'}
          style={styles.headerIcon}
        />
        <Text style={styles.title} numberOfLines={2}>
          {title.toUpperCase()}
        </Text>
      </View>

      {/* Value */}
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {/* Subtitle / Description / Mini gauge */}
      {bottomElement ? (
        <View style={styles.bottomSlot}>{bottomElement}</View>
      ) : subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </GlassCard>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.wrapper}>
        {CardContent}
      </TouchableOpacity>
    );
  }

  return <View style={styles.wrapper}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    padding: 16,
    minHeight: 146,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerIcon: {
    marginRight: 6,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 15,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  value: {
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -0.5,
    color: '#FFFFFF',
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 17,
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  bottomSlot: {
    marginTop: 6,
  },
});
