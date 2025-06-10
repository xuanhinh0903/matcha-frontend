import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Message } from '../../../../../types/message.type';
import { colors, matchaColors } from '../styles/MessageList.styles';
import moment from 'moment';
import { Ionicons } from '@expo/vector-icons';

interface MessageItemProps {
  message: Message;
  currentUserId: number;
  searchTerm?: string;
  isHighlighted?: boolean;
}

const { width, height } = Dimensions.get('window');

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUserId,
  searchTerm,
  isHighlighted,
}) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const isCurrentUser = message.sender.user_id === currentUserId;
  const messageTime = moment(message.sent_at).format('LT'); // Format time e.g., 10:30 AM

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight?.trim()) {
      return (
        <Text
          style={[
            styles.messageContentText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText,
          ]}
        >
          {text}
        </Text>
      );
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <Text
        style={[
          styles.messageContentText,
          isCurrentUser ? styles.currentUserText : styles.otherUserText,
        ]}
      >
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <Text key={i} style={styles.highlightedText}>
              {part}
            </Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <View
      style={[
        styles.messageContainer,
        isCurrentUser
          ? styles.currentUserMessageContainer
          : styles.otherUserMessageContainer,
        isHighlighted ? styles.highlightedMessageBackground : {},
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        {message.content_type === 'text' ? (
          highlightText(message.content, searchTerm)
        ) : message.content_type === 'image' ? (
          <TouchableOpacity onPress={() => setImageModalVisible(true)}>
            <Image
              source={{ uri: message.content }}
              style={styles.messageImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : (
          <Text
            style={[
              styles.messageContentText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
            ]}
          >
            Unsupported message type
          </Text>
        )}
        <Text
          style={[
            styles.messageTime,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
          ]}
        >
          {messageTime}
        </Text>
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: message.content }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  currentUserMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherUserMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  currentUserBubble: {
    backgroundColor: matchaColors.primary,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: matchaColors.primaryLight,
    borderBottomLeftRadius: 4,
  },
  messageContentText: {
    fontSize: 16,
  },
  currentUserText: {
    color: matchaColors.text.light,
  },
  otherUserText: {
    color: matchaColors.text.dark,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  currentUserTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherUserTime: {
    color: matchaColors.text.gray,
  },
  highlightedText: {
    backgroundColor: '#FFF59D',
    fontWeight: 'bold',
    color: matchaColors.text.dark,
  },
  highlightedMessageBackground: {
    backgroundColor: 'rgba(200, 230, 201, 0.4)',
    borderRadius: 5,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MessageItem;
