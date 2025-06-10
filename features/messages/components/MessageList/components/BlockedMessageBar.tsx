import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles/MessageList.styles';

interface BlockedMessageBarProps {
  message: string;
}

const BlockedMessageBar: React.FC<BlockedMessageBarProps> = ({ message }) => {
  return (
    <View style={styles.blockedMessageContainer}>
      <Text style={styles.blockedMessageText}>{message}</Text>
    </View>
  );
};

export default BlockedMessageBar;
