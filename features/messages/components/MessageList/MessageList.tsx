import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, FlatList, Platform, View } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { callEvents } from '../../utils/eventEmitter';

// API Hooks
import { useCallSocket, useStartCall } from '../../../../api/calls';
import { client } from '../../../../api/common/client';
import { useConversation } from '../../../../api/conversations';
import {
  useMessages,
  useSearchMessages,
  useSendMessage,
} from '../../../../api/messages';

// Utils and Helpers
import {
  getAuthToken,
  getAuthUser,
} from '../../../../store/global/auth/auth.slice';
import { callsActions } from '../../../../store/global/calls';

// Types and Interfaces
import { Message } from '../../../../types/message.type';
import { User } from '../../../../types/user.type';
import { MessageListProps } from './interfaces';

// Components
import { ConversationInfoModal } from '../ConversationInfoModal';
import BlockedMessageBar from './components/BlockedMessageBar';
import MessageHeader from './components/MessageHeader';
import MessageInput from './components/MessageInput';
import MessageItem from './components/MessageItem';
import MessageListView from './components/MessageListView';
import MessageSearchBar from './components/MessageSearchBar';
import MessageListSkeleton from './message-list-skeleton';

// Custom hooks, animations and utilities
import { createAnimationStyles } from './animations/messageListAnimations';
import { useMessageListLogic } from './hooks/useMessageListLogic';
import { createMessageGroupsWithContext } from './utils/messageUtils';

// Styles
import { styles } from './styles/MessageList.styles';

const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  onBack,
  visible,
}) => {
  console.log('MESSAGE LIST RENDERED');
  const dispatch = useDispatch();
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [showConversationInfoModal, setShowConversationInfoModal] =
    useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [callStatus, setCallStatus] = useState<
    'initiating' | 'ringing' | 'connected' | 'ended' | null
  >(null);
  const [isOutgoingCall, setIsOutgoingCall] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [activeCallId, setActiveCallId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Ref to automatically scroll to first search result
  const flatListRef = useRef<FlatList>(null);

  // Redux State
  const authState = useSelector((state: any) => state.auth);
  const authUser = useSelector(getAuthUser);
  const token = useSelector(getAuthToken);

  // Fetch conversation data from API
  const { data: conversationData, isLoading: isLoadingConversation } =
    useConversation(conversationId, token || '');

  // Convert auth user to full User type
  const currentUser = useMemo(() => {
    if (!authUser) return null;

    const now = new Date().toISOString();

    return {
      user_id: authUser.id,
      id: authUser.id, // Keep id for backward compatibility
      full_name: authUser.email?.split('@')[0] || 'User', // Use part before @ in email as name
      email: authUser.email,
      phone_number: null,
      birthdate: '',
      gender: null as 'male' | 'female' | 'other' | null,
      location: null,
      bio: null,
      is_online: true,
      created_at: now,
      updated_at: now,
    } as User;
  }, [authUser]);

  // API Hooks
  const { data, isLoading, isFetching, refetch } = useMessages({
    conversationId,
    limit: 20,
    page,
  });

  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useSearchMessages({
    conversationId,
    query: searchQuery,
    limit: 100,
    page: 1,
    enabled: isSearchActive && searchQuery.length >= 1,
  });

  // API Service Hooks
  const { mutateAsync: startCallMutation } = useStartCall(token || '');
  const { socket } = useCallSocket(token || '');
  const { mutateAsync: sendMessage, isPending } = useSendMessage(token || '');

  // Derived State
  const isBlocked = !!data?.isBlocked;

  console.log('conversationData.other_user', conversationData?.other_user);
  // Get other participant from conversation data
  const otherUser = useMemo(() => {
    if (!currentUser || !conversationData) return null;
    return conversationData.other_user
      ? {
          ...conversationData.other_user,
          user_id: conversationData.other_user.user_id,
          full_name: conversationData.other_user.full_name,
          photo_url: conversationData.other_user.photo_url || '',
          is_online: conversationData.other_user.is_online,
        }
      : null;
  }, [conversationData, currentUser]);

  // Determine block message for each user
  const blockMessage = useMemo(() => {
    if (!isBlocked || !currentUser || !otherUser) return '';
    return `You have blocked or been blocked by ${otherUser.full_name}. You cannot send messages or call.`;
  }, [isBlocked, currentUser, otherUser]);

  // Animation values
  const translateX = useSharedValue(0);
  const overlayOpacity = useSharedValue(0.5); // Start with half opacity for better content visibility

  // Modified call handlers to use router navigation to outgoing call screen
  const handleCall = useCallback(() => {
    if (!otherUser || !currentUser || !token) {
      Alert.alert('Error', 'Cannot initiate call. User data missing.');
      return;
    }

    console.log(`Initiating audio call to ${otherUser.full_name}`);
    setIsOutgoingCall(true);
    setCallStatus('initiating');

    startCallMutation({
      callerId: currentUser.user_id,
      receiverId: otherUser.user_id,
      callType: 'audio', // Audio call
    })
      .then((result) => {
        console.log('result.callDetails', result.callDetails);
        const callId = String(result.callDetails.callId);
        if (!callId) return;
        setActiveCallId(Number(callId));
        console.log(`Call initiated with ID: ${callId}`);

        // Store call information in Redux - without the refetch function
        dispatch(
          callsActions.initiateCall({
            callId,
            isOutgoing: true,
            userId: otherUser.user_id,
            userName: otherUser.full_name || 'Unknown User',
            userAvatar: otherUser.photo_url || 'https://picsum.photos/200',
            callType: 'audio',
          })
        );

        console.log('Navigating to outgoing call screen');
        // Pass conversationId via params so it can be used to trigger refresh
        router.push({
          pathname: '/(call)',
          params: {
            userId: otherUser.user_id.toString(),
            userName: otherUser.full_name || 'Unknown User',
            userAvatar: otherUser.photo_url || 'https://picsum.photos/200',
            callType: 'audio', // Audio call
            callId: callId,
            conversationId: conversationId.toString(),
            isOutgoing: 'true',
          },
        });
      })
      .catch((error) => {
        console.error('Failed to start call:', error);
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Unknown error';
        Alert.alert('Error', `Failed to start call: ${errorMessage}`);
        setCallStatus(null);
        setActiveCallId(null);
      });
  }, [
    otherUser,
    currentUser,
    token,
    dispatch,
    startCallMutation,
    conversationId,
  ]);

  // Video call handler
  const handleVideoCall = useCallback(() => {
    if (!otherUser || !currentUser || !token) {
      Alert.alert('Error', 'Cannot initiate video call. User data missing.');
      return;
    }

    console.log(`Initiating video call to ${otherUser.full_name}`);
    setIsOutgoingCall(true);
    setCallStatus('initiating');

    startCallMutation({
      callerId: currentUser.user_id,
      receiverId: otherUser.user_id,
      callType: 'video', // Video call instead of audio
    })
      .then((result) => {
        console.log('Video call details:', result.callDetails);
        const callId = String(result.callDetails.callId);
        if (!callId) return;
        setActiveCallId(Number(callId));
        console.log(`Video call initiated with ID: ${callId}`);

        // Store call information in Redux with video call type
        dispatch(
          callsActions.initiateCall({
            callId,
            isOutgoing: true,
            userId: otherUser.user_id,
            userName: otherUser.full_name || 'Unknown User',
            userAvatar: otherUser.photo_url || 'https://picsum.photos/200',
            callType: 'video', // Set as video call
          })
        );

        console.log('Navigating to outgoing video call screen');
        // Navigate to outgoing call screen with video call type
        router.push({
          pathname: '/(call)', // Specify the video-outgoing screen
          params: {
            userId: otherUser.user_id.toString(),
            userName: otherUser.full_name || 'Unknown User',
            userAvatar: otherUser.photo_url || 'https://picsum.photos/200',
            callType: 'video', // Set as video call
            callId: callId,
            conversationId: conversationId.toString(),
            isOutgoing: 'true', // Explicitly set as outgoing call
          },
        });
      })
      .catch((error) => {
        console.error('Failed to start video call:', error);
        const errorMessage =
          error?.response?.data?.message || error?.message || 'Unknown error';
        Alert.alert('Error', `Failed to start video call: ${errorMessage}`);
        setCallStatus(null);
        setActiveCallId(null);
      });
  }, [
    otherUser,
    currentUser,
    token,
    dispatch,
    startCallMutation,
    conversationId,
  ]);

  // Animation styles
  const { overlayStyle, animatedStyle } = createAnimationStyles(
    translateX,
    overlayOpacity
  );

  // Use MessageListLogic hook with updated parameters (no callModalVisible)
  useMessageListLogic({
    socket,
    otherUser,
    callModalVisible: false, // We're not using the modal anymore
    setCallModalVisible: () => {}, // Empty function
    setCallStatus,
    setIsOutgoingCall,
    setActiveCallId,
    setCallDuration,
    callStatus,
    activeCallId,
    token,
    currentUser,
    authState,
    conversationId,
  });

  // Memoize regular message list data with deduplication
  const regularMessageList = useMemo(() => {
    const messages = data?.messages || [];

    // Combine messages and remove duplicates by message_id
    const combined = [...localMessages, ...messages];
    const uniqueMessages = combined.reduce((acc, current) => {
      const isDuplicate = acc.find(
        (item) => item.message_id === current.message_id
      );
      if (!isDuplicate) {
        return [...acc, current];
      }
      return acc;
    }, [] as Message[]);

    return uniqueMessages;
  }, [localMessages, data?.messages]);

  // Create message groups with context for search results
  const messageGroups = useMemo(() => {
    if (isSearchActive && searchResults?.messages?.length && data?.messages) {
      const allMessages = [...localMessages, ...data.messages];
      return createMessageGroupsWithContext(
        searchResults.messages,
        allMessages
      );
    }
    return [];
  }, [isSearchActive, searchResults, localMessages, data?.messages]);

  // Event Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setPage(1);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setIsSearchActive(true);

    // Reset to top when searching
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      }
    }, 300);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setIsSearchActive(false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (
      !isLoading &&
      !isFetching &&
      data?.meta &&
      page < data.meta.totalPages &&
      !isSearchActive // Don't load more during search
    ) {
      setPage((prev) => prev + 1);
    }
  }, [isLoading, isFetching, data?.meta, page, isSearchActive]);

  const handleInfoPress = useCallback(() => {
    setShowConversationInfoModal(true);
  }, []);

  // Upload image to server
  const uploadImage = async (uri: string): Promise<string> => {
    try {
      const formData = new FormData();
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('file', {
        uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);

      // Use the new dedicated message image upload endpoint
      const response = await client.post(
        `/messages/upload-image/${conversationId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.error) {
        throw new Error(response.data.error);
      }

      // Extract the image URL from the response
      return response.data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Pick image from library
  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setIsUploading(true);

        try {
          const imageUrl = await uploadImage(uri);

          await sendMessage({
            content: imageUrl,
            conversationId,
            contentType: 'image',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to upload and send image');
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'There was a problem selecting the image');
    }
  };

  // Capture image using camera
  const handleCaptureImage = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        setIsUploading(true);

        try {
          const imageUrl = await uploadImage(uri);

          await sendMessage({
            content: imageUrl,
            conversationId,
            contentType: 'image',
          });
        } catch (error) {
          Alert.alert('Error', 'Failed to upload and send image');
          console.error(error);
        } finally {
          setIsUploading(false);
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'There was a problem capturing the image');
    }
  };

  // Send message handler
  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser || !token || isPending) return;

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately

    // Create temporary local message ID to track this specific message
    const tempId = Date.now(); // Use numeric timestamp instead of string

    try {
      // Send actual message through API
      await sendMessage({
        content: messageToSend,
        conversationId,
        contentType: 'text',
      });

      // Don't remove the optimistic message here anymore
      // The socket/API will replace it instead
    } catch (error: any) {
      console.error('Failed to send message:', error);

      const errorMessage =
        error?.message ||
        (error?.error && typeof error.error === 'string'
          ? error.error
          : 'Unknown error');

      Alert.alert('Error', `Failed to send message: ${errorMessage}`);
      setNewMessage(messageToSend);
    }
  };

  // Request permissions for photo library
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (libraryStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera roll permissions to send images!'
          );
        }

        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Sorry, we need camera permission to take photos!'
          );
        }
      }
    })();
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (!visible || !conversationId) return;

    refetch().catch((error) => {
      console.error('Failed to fetch messages:', error);
    });
  }, [visible, conversationId]);

  // Log search information
  useEffect(() => {
    if (isSearchActive) {
      console.log(
        'Search query enabled:',
        isSearchActive,
        'Query:',
        searchQuery
      );
    }
  }, [isSearchActive, searchQuery, isSearching, searchResults, searchError]);

  // Socket connection status listener
  useEffect(() => {
    if (!socket) return;

    const handleSocketConnect = () => {
      console.log('Socket connected in MessageList component');
      if (!data?.messages?.length) {
        console.log('Refetching messages on socket connect');
        refetch();
      }
    };

    // Handle automatic refresh when new call logs are saved
    const handleRefreshMessages = (data: { conversationId: number }) => {
      console.log('Received refresh_messages event:', data);

      // Only refresh if it's for the current conversation
      if (data.conversationId === conversationId) {
        console.log(
          'Refreshing message list for conversation:',
          conversationId
        );
        refetch();
      }
    };

    socket.on('connect', handleSocketConnect);
    socket.on('refresh_messages', handleRefreshMessages);

    return () => {
      socket.off('connect', handleSocketConnect);
      socket.off('refresh_messages', handleRefreshMessages);
    };
  }, [socket, data?.messages, conversationId, refetch]);

  // Refresh after call ends
  useEffect(() => {
    const handleCallEnd = () => {
      console.log('Call ended, refreshing messages');
      refetch();
    };

    // Register for the call end event for this conversation
    const eventName = `call_end_${conversationId}`;
    callEvents.on(eventName, handleCallEnd);

    return () => {
      callEvents.off(eventName, handleCallEnd);
    };
  }, [refetch, conversationId]);

  // Optimize message list rendering with memoization
  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageItem message={item} currentUserId={currentUser?.user_id || 0} />
    ),
    [currentUser?.user_id]
  );

  // Show loading state if auth not ready or missing
  if (!authState?._persist?.rehydrated || !token || !currentUser) {
    return <MessageListSkeleton />;
  }

  const isInitialLoading = isLoading && page === 1;

  // Improved rendering strategy with progressive loading
  const renderContent = () => {
    // We'll show the basic UI structure even if some data is still loading
    return (
      <View style={styles.container}>
        {/* Header - Show immediately with minimal data or skeleton if needed */}
        <MessageHeader
          onBack={onBack}
          otherUser={
            otherUser || {
              user_id: Number(conversationId),
              full_name: 'Loading...',
              is_online: false,
              photo_url: '',
            }
          }
          handleCall={handleCall}
          handleVideoCall={handleVideoCall}
          handleInfoPress={handleInfoPress}
          isBlocked={isBlocked}
          isLoading={!otherUser}
        />

        {/* Search Bar */}
        {isSearchActive && (
          <MessageSearchBar
            searchQuery={searchQuery}
            resultsCount={searchResults?.messages?.length}
            isSearching={isSearching}
            handleClearSearch={handleClearSearch}
          />
        )}

        {/* Message Lists - Show loading indicator only for messages area */}
        {isInitialLoading || !data ? (
          <View style={styles.messagesLoadingContainer}>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageSkeletonItem,
                    index % 2 === 0
                      ? styles.messageSkeletonRight
                      : styles.messageSkeletonLeft,
                  ]}
                />
              ))}
          </View>
        ) : (
          <MessageListView
            isSearchActive={isSearchActive}
            messages={regularMessageList}
            messageGroups={messageGroups}
            isRefreshing={isRefreshing}
            isSearching={isSearching}
            handleRefresh={handleRefresh}
            handleLoadMore={handleLoadMore}
            renderItem={renderItem}
            flatListRef={flatListRef}
            currentUserId={currentUser.user_id}
            searchQuery={searchQuery}
          />
        )}

        {/* Input Area or Blocked Message */}
        {isBlocked ? (
          <BlockedMessageBar message={blockMessage} />
        ) : (
          <MessageInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSend={handleSend}
            handlePickImage={handlePickImage}
            handleCaptureImage={handleCaptureImage}
            isUploading={isUploading}
            isPending={isPending}
            disabled={isInitialLoading || !data || !otherUser}
          />
        )}
      </View>
    );
  };

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[styles.messageModalOverlay, overlayStyle]} />

        <PanGestureHandler activeOffsetX={[-20, 20]} failOffsetY={[-20, 20]}>
          <Animated.View style={[styles.messageModalContent, animatedStyle]}>
            {renderContent()}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>

      {otherUser && conversationData && (
        <ConversationInfoModal
          visible={showConversationInfoModal}
          onClose={() => setShowConversationInfoModal(false)}
          onDelete={() => {
            onBack();
          }}
          onSearch={handleSearch}
          conversation={{
            conversation_id: conversationData.conversation_id,
            created_at: conversationData.created_at,
            other_user: conversationData.other_user,
          }}
          otherUser={otherUser}
        />
      )}
    </>
  );
};

export default MessageList;
