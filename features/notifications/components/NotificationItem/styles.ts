import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    minHeight: 88,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    backgroundColor: '#FFFFFF',
  },
  unread: {
    backgroundColor: 'rgba(46, 235, 112, 0.05)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Thêm này để căn chỉnh
    gap: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  systemTextContainer: {
    flex: 1,
    marginLeft: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontWeight: '600',
    color: '#2EEB70',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  systemName: {
    fontWeight: '600',
    color: '#1A1A1A',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  notificationType: {
    color: 'rgba(0, 0, 0, 0.5)',
    fontSize: 13,
    marginLeft: 4,
  },
  messageContainer: {
    flexDirection: 'column',
    gap: 6,
  },
  messageContent: {
    color: '#1A1A1A',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  notificationAction: {
    color: 'rgba(0, 0, 0, 0.7)',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.4)',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    height: 40,
    width: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  deleteIcon: {
    color: 'rgba(255, 59, 48, 0.9)',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  underlayLeft: {
    flex: 1,
    backgroundColor: 'rgba(255, 59, 48, 0.95)',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20,
  },
  swipeableContainer: {
    backgroundColor: '#FFFFFF',
  }
});