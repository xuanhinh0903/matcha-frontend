import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles';

export interface AboutSectionProps {
  bio?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ bio }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Me</Text>
      <View style={styles.content}>
        <Text style={bio ? styles.bioText : styles.emptyText}>
          {bio || 'No description yet'}
        </Text>
      </View>
    </View>
  );
};
