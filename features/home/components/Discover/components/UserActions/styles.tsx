import { StyleSheet } from 'react-native';

// Lighter, more vibrant colors
const matchaGreen = '#4ADE80';
const rejectRed = '#FF5A87';

export const UserActionsStyleSheet = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
    width: '100%',
  },
  iconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'white',
  },
  closeWrapper: {
    borderWidth: 2,
    borderColor: rejectRed,
  },
  heartWrapper: {
    borderWidth: 2,
    borderColor: matchaGreen,
  },
});
