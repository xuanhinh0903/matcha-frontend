import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
// Use Math.floor for robustness against floating point issues
const photoSize = Math.floor((width - 55 - 20) / 3); // 20 padding horizontal, 10 gap * 2

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 30,
    justifyContent: 'center',
  },
  photoSlot: {
    width: photoSize,
    height: photoSize * 1.5, // Adjust aspect ratio as needed
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Needed for absolute positioning of buttons
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: 'green',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addButtonIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  addButtonLinearGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  removeButtonIcon: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 30,
  },
  continueButton: {
  },
  continueButtonDisabled: {
    backgroundColor: '#e0e0e0',
  },
});
