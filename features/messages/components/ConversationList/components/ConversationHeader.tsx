import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../../../styles';

export const ConversationHeader: React.FC = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>Messages</Text>
    </View>
  );
};

export default React.memo(ConversationHeader);
