import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 10,
  },
  title: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
});
