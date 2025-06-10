import { StyleSheet } from 'react-native';

const matchaGreen = '#46ec62';

export const DiscoverStyleSheet = StyleSheet.create({
  swipeCardWrapper: {
    width: '100%',
    height: '100%',
    // Center the deck; the ScrollView container already fixes the height
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  likeContainer: {
    left: 45,
    transform: [{ rotate: '-30deg' }],
  },
  nopeContainer: {
    right: 45,
    transform: [{ rotate: '30deg' }],
  },
});
