import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

export interface AvatarProps {
  imageUrl?: string;
  size?: number;
  style?: any;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  size = 40,
  style,
}) => {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: '#E1E1E1',
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  });

  return (
    <View style={[styles.container, style]}>
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

export default Avatar;
