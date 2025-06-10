import { StyleSheet } from 'react-native';

export const InputStyleSheet = StyleSheet.create({
  input: {
    padding: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    color: 'gray',
    width: '100%',
    maxWidth: 360,
    maxHeight: 40,
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
});
