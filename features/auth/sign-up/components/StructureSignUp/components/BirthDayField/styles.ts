import { StyleSheet } from 'react-native';

const placeholderColor = '#cccccc'; // Lighter grey for placeholder
const inputBorderColor = '#e0e0e0'; // Light grey for underline
const inputTextColor = '#000'; // Black for input text
const descriptionColor = '#a9a9a9'; // Grey for description text
const errorColor = '#ff0000'; // Red for error text and borders

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 100,
  },
  titleContainer:{
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'left',
    maxWidth: '80%',
  },
  dateInputContainer: {
   
  },
  dateInputRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 5,
    width: '100%',
    justifyContent: 'flex-start',
  },
  input: {
    fontSize: 18,
    color: inputTextColor,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: inputBorderColor,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderBottomColor: errorColor,
  },
  yearInput: {
    width: 75,
    letterSpacing: 2,
  },
  monthInput: {
    width: 45,
    letterSpacing: 2,
  },
  dayInput: {
    width: 45,
    letterSpacing: 2,
  },
  separator: {
    fontSize: 18,
    color: inputTextColor,
    marginHorizontal: 8,
    paddingBottom: 8,
  },
  placeholderText: { 
    color: placeholderColor,
  },
  description: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 20,
    color: descriptionColor,
  },
  errorText: {
    color: errorColor,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  continueButtonContainer: {
    width: '100%',
    marginTop: 20,
  },
}); 