import { StyleSheet } from 'react-native';

export const SignUpStyleSheet = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 300,
    gap: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formField: {
    gap: 10,
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
  },
  profileImg: {
    width: 300,
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    display: 'flex',
  },
  errorText: {
    color: '#ff0000',
    fontSize: 12,
    marginTop: 4,
  },
  backButton: {
    marginTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#0066cc',
  },
  buttonGroup: {
    gap: 12,
  },
});
