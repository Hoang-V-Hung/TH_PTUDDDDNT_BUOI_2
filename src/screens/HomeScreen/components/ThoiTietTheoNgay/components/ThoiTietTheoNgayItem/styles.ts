import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    width: 70,
  },
  icon: {
    width: 34,
    textAlign: 'center',
    marginHorizontal: 6,
  },
  tempContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lowText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 17,
    fontWeight: '500',
    width: 34,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  barBackground: {
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  highText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
    width: 34,
    textAlign: 'right',
  },
});
