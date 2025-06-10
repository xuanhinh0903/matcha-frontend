import React from 'react';
import { View, Text } from 'react-native';
import { MessageWithContext } from '../interfaces';
import MessageItem from './MessageItem';
import { styles } from '../styles/MessageList.styles';

interface MessageGroupWithContextProps {
  messageGroup: MessageWithContext;
  currentUserId: number;
  searchTerm?: string;
}

const MessageGroupWithContext: React.FC<MessageGroupWithContextProps> = ({
  messageGroup,
  currentUserId,
  searchTerm,
}) => {
  const { matchedMessage, contextMessages } = messageGroup;

  return (
    <View style={styles.messageGroupContainer}>
      {/* Context label */}
      <View style={styles.contextLabel}>
        <Text style={styles.contextLabelText}>Conversation Snippet</Text>
      </View>

      {/* Context messages */}
      {contextMessages.map((message) => (
        <MessageItem
          key={`context-${message.message_id}`}
          message={message}
          currentUserId={currentUserId}
          searchTerm={
            message.message_id === matchedMessage.message_id
              ? searchTerm
              : undefined
          }
          isHighlighted={message.message_id === matchedMessage.message_id}
        />
      ))}

      {/* Separator between message groups */}
      <View style={styles.messageGroupSeparator} />
    </View>
  );
};

export default MessageGroupWithContext;
