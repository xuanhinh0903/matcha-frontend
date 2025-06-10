import { StyleSheet } from 'react-native';

export const ChoiseStyleSheet = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 20,
    padding: 8,
    paddingHorizontal: 15,
    borderWidth: 3,
    borderRadius: 10,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  label: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
