import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles';

export interface StatItemProps {
  icon: string;
  value: string;
  label: string;
  color: string;
  backgroundColor: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  icon,
  value,
  label,
  color,
  backgroundColor,
}) => (
  <View style={styles.statItem}>
    <View style={[styles.featureIcon, { backgroundColor, marginBottom: 8 }]}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);
