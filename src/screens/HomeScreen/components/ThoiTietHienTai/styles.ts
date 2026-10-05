import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  cityText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  tempText: {
    fontSize: 86,
    color: '#FFFFFF',
    fontWeight: '100',
    lineHeight: 96,
    marginVertical: 2,
  },
  conditionText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
  highLowContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  highLowText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '400',
  },
});
