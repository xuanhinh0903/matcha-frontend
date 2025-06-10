import { StyleSheet } from 'react-native';

export const DiscoverStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // Add space for status bar
  },
  logo: {
    width: 150,
    height: 70,
    marginTop: 20,
  },
  discoverWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  nameAge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  ageText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 4,
  },
  distanceText: {
    color: 'white',
    fontSize: 16,
    marginTop: 4,
  },
});
