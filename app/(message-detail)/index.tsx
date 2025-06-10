import { MessageList } from '@/features/messages/components/MessageList';
import { useIsFocused } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { messagesApi } from '@/rtk-query/messages';

export default function MessageDetail() {
  const params = useLocalSearchParams();
  const conversationId = params.conversation_id as string;
  const router = useRouter();
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  // Invalidate conversations list when navigating away from this screen
  useEffect(() => {
    return () => {
      // This runs when the component unmounts (user navigates away)
      console.log(
        'Message detail screen unmounted, invalidating conversations list'
      );
      dispatch(messagesApi.util.invalidateTags(['Conversations']));
    };
  }, [dispatch]);

  if (!isFocused) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar style="light" />
      <MessageList
        conversationId={Number(conversationId)}
        onBack={() => {
          router.push('/(tabs)/messages');
        }}
        visible={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
  },
  videoContainer: {
    padding: 0,
  },
});
