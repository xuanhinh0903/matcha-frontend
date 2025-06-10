import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useMessageSocket } from '../../api/messages';
import { getAuthToken, getAuthUser } from '../../store/global/auth/auth.slice';
import { ConversationList } from './components/ConversationList';
import { styles } from './styles';

export const MessagesScreen = () => {
  const user = useSelector(getAuthUser);
  const token = useSelector(getAuthToken);

  // Initialize WebSocket connection
  const { socket } = useMessageSocket(token || '');
  const router = useRouter();
  // If not authenticated, the useProtectedRoute hook will handle redirection
  if (!user) return null;

  return (
    <View style={styles.container}>
      <ConversationList
        onSelectConversation={(conversation) => {
          router.push({
            pathname: '/(message-detail)',
            params: {
              conversation_id: conversation.conversation_id,
              conversation: JSON.stringify(conversation),
            },
          });
        }}
      />
    </View>
  );
};

export default React.memo(MessagesScreen);
