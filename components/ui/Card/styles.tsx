import { StyleSheet } from 'react-native';

export const CardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignSelf: 'center', // Center the card
    margin: 8,
    width: 'auto',
    height: 'auto',
  },
  cover: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  coverContainer: {
    width: '100%', // Ensure full width
    height: '100%', // Ensure full height
    justifyContent: 'flex-end',
  },
  info: {
    backgroundColor: 'rgba(0,0,0,0.5)', // Darker gradient overlay
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
  distance: {
    color: 'white',
    fontSize: 14,
    marginTop: 4,
  },
  photoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});
