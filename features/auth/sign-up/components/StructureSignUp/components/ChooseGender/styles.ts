import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
   flex: 1,
   width: '100%',
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginTop: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    width: '100%',
    textAlign: 'center',
  },
  genderContainer: {
    marginTop: 60,
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  gender: {
    fontSize: 18,
    color: '#C6C5C7',
    paddingHorizontal: 116,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#C6C5C7',
    borderRadius: 65,
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#C6C5C7',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#35c848',
    borderColor: '#35c848',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#000',
  },
  continueButtonContainer: {
    width: '100%',
    marginTop: 30,
  },
  checkboxWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
}); 