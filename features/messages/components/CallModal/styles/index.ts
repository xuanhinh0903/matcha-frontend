import { colors } from '@/features/messages/styles';
import { Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2c3630',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    display: 'flex',
    position: 'relative',
  },
  headerContainer: {
    alignItems: 'center',
    width: '100%',
    paddingBottom: 20,
    color: 'white',
  },
  timerText: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    display: 'flex',
  },
  userName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 40,
    textAlign: 'center',
  },
  avatarContainer: {
    padding: 8,
    borderRadius: 140,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 15,
  },
  defaultAvatarBg: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 3,
    borderColor: colors.primary,
  },
  connectedAvatarBg: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 3,
    borderColor: 'rgb(16, 185, 129)',
  },
  endedAvatarBg: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 3,
    borderColor: 'rgb(239, 68, 68)',
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  incomingActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  endCallContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  acceptButton: {
    backgroundColor: '#10B981', // Green
    width: 80,
    height: 80,
  },
  rejectButton: {
    backgroundColor: '#EF4444', // Red
    width: 80,
    height: 80,
  },
  endButton: {
    backgroundColor: '#EF4444', // Red
    width: 90,
    height: 90,
  },
  closeButton: {
    backgroundColor: '#6B7280', // Gray
    width: 80,
    height: 80,
  },
  buttonText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});
