import React from 'react';
import {
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../styles';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  white: '#FFFFFF',
  textLight: '#5F7161',
};

interface MediaTabProps {
  mediaData: any;
  isLoading: boolean;
}

export const MediaTab: React.FC<MediaTabProps> = ({ mediaData, isLoading }) => {
  const renderMediaItem = ({ item }: { item: any }) => (
    <View style={styles.mediaItem}>
      <Image
        source={{ uri: item.content }}
        style={styles.mediaImage}
        resizeMode="cover"
      />
    </View>
  );

  const renderEmptyMedia = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={matchaColors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="images-outline"
          size={48}
          color={matchaColors.secondary}
        />
        <Text style={styles.emptyText}>
          No media shared in this conversation
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.mediaContainer}>
      {mediaData?.media && mediaData.media.length > 0 ? (
        <FlatList
          data={mediaData.media}
          renderItem={renderMediaItem}
          keyExtractor={(item) => `media_${item.message_id}`}
          numColumns={3}
          contentContainerStyle={styles.mediaList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        renderEmptyMedia()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mediaContainer: {
    flex: 1,
    flexGrow: 1,
    padding: 8,
    backgroundColor: matchaColors.white,
    zIndex: 1,
  },
  mediaList: {
    padding: 5,
    backgroundColor: matchaColors.white,
    paddingBottom: 40,
  },
  mediaItem: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 3,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: matchaColors.light,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: matchaColors.white,
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: matchaColors.textLight,
    textAlign: 'center',
    fontSize: 16,
  },
});
