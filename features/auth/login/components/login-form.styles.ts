import { StyleSheet } from 'react-native';

export const LoginFormStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  formField: {
    gap: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
  },
  anchor: {
    marginTop: 16,
    color: '#0066cc',
    textAlign: 'center',
    cursor: 'pointer',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
});
