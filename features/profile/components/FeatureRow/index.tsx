import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles';

export interface FeatureRowProps {
  icon?: string;
  label: string;
  color: string;
  backgroundColor: string;
  onPress?: () => void;
}

export const FeatureRow: React.FC<FeatureRowProps> = ({
  icon,
  label,
  color,
  backgroundColor,
  onPress,
}) => (
  <TouchableOpacity style={styles.featureRow} onPress={onPress}>
    <View style={[styles.featureIcon, { backgroundColor }]}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.featureText}>{label}</Text>
    <Ionicons name="chevron-forward" size={20} color={color} />
  </TouchableOpacity>
);
