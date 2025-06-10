import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 140,
    width: 'auto',
    minWidth: 340,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 24,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  codeBox: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#000000',
  },
  codeInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  emailInputContainer: {
    width: '100%',
    marginBottom: 10,
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#828693',
    lineHeight: 20,
    marginTop: 10,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#000',
  },
  loginLink: {
    color: '#0066cc',
    textAlign: 'center',
    cursor: 'pointer',
    marginTop: 15,
  },
  continueButton: {
    marginTop: 20,
    width: 'auto',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText:{
    fontSize: 12,
    color: 'red',
    marginBottom: 10,
  },
  code: {
    fontWeight: '400',
    fontSize: 18,
    color: '#444142',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  formField: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  }
}); 