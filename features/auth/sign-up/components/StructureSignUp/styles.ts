import { StyleSheet } from 'react-native';

export const Styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
  },
  arrowLeft: {
    resizeMode: 'contain',
    position: 'absolute',
    left: 10,
    top: 35,
  },
  logoArrowLeft: {
    resizeMode: 'contain',
    width: 18,
    height: 18,
  },
    progressContainer: {
    height: 4,
    backgroundColor: '#E5E5E5',
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E94E84',
    borderRadius: 2,
  },
});
