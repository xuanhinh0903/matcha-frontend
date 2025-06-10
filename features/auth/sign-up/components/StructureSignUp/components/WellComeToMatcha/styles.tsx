import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 30,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  rulesContainer: {
    width: '100%',
    marginBottom: 20,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#a7a7a7',
    paddingTop: 10,
  },
  numberContainer: {
    width: 20,
    alignItems: 'flex-start',
  },
  numberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  ruleContent: {
    flex: 1,
    paddingRight: 10,
    marginBottom: 10
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    flex: 1,
  },
  bulletPoint: {
    marginRight: 6,
    fontSize: 18,
    color: '#666',
    lineHeight: 20,
    width: 6,
    height: 6,
    backgroundColor: '#666',
    borderRadius: 100,
    marginTop: 7.5,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
    marginVertical: 10,
  },
  subSectionRow: {
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
  },
  subSectionNumber: {
    width: 30,
    alignItems: 'flex-start',
  },
  subSectionNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  subSectionContent: {
    flex: 1,
    paddingRight: 10,
  },
  agreeButtonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#46ec62',
    borderColor: '#35c848',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 14,
    color: '#444',
  }
});
