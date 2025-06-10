import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';

import { Photo } from '../../interfaces';
import { styles } from './styles';

export interface PhotoGridProps {
  photos: Photo[];
  maxPhotos?: number;
  onAddPhoto: () => void;
  onDeletePhoto: (photoId: number) => void;
  isUploading: boolean;
  isDeleting: boolean;
  deletingPhotoId?: number | null;
}

const { width, height } = Dimensions.get('window');

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  maxPhotos = 9,
  onAddPhoto,
  onDeletePhoto,
  isUploading,
  isDeleting,
  deletingPhotoId = null,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const remainingSlots = maxPhotos - photos.length;

  const handlePhotoPress = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  return (
    <View style={styles.grid}>
      {photos.map((photo) => (
        <View key={photo.photo_id} style={styles.photoContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handlePhotoPress(photo.photo_url)}
          >
            <Image source={{ uri: photo.photo_url }} style={styles.photo} />
            {deletingPhotoId === photo.photo_id && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.6)',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 2,
              }}>
                <ActivityIndicator size="small" color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
          {deletingPhotoId !== photo.photo_id && (
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => onDeletePhoto(photo.photo_id)}
            >
              <MaterialCommunityIcons name="delete" size={16} color="#E91E63" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {remainingSlots > 0 && (
        <View style={styles.photoContainer}>
          <TouchableOpacity
            style={styles.addPhotoContainer}
            onPress={onAddPhoto}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Ionicons name="add" style={styles.addPhotoIcon} />
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Fullscreen Photo Modal */}
      <Modal
        visible={!!selectedPhoto}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View style={styles.modalContainer}>
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedPhoto(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* {true && (
        <Modal
          visible={true}
          transparent
          animationType="fade"
        >
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(7, 7, 7, 0.47)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <ActivityIndicator size="large" color="#4CAF50" />
          </View>
        </Modal>
      )} */}
    </View>
  );
};
