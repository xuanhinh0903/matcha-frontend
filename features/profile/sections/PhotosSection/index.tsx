import React, { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';

import { Photo } from '../../interfaces';
import { PhotoGrid } from '../../components/PhotoGrid';
import { styles } from './styles';
import { useGetUserPhotosQuery } from '@/rtk-query';

export interface PhotosSectionProps {
  // photos: Photo[];
  isUploading: boolean;
  onAddPhoto: () => void;
  onDeletePhoto: (photoId: number) => void;
  isRefreshing: boolean;
  isDeleting: boolean;
  deletingPhotoId?: number | null;
}

export const PhotosSection: React.FC<PhotosSectionProps> = ({
  // photos,
  isUploading,
  onAddPhoto,
  onDeletePhoto,
  isRefreshing,
  isDeleting,
  deletingPhotoId = null,
}) => {
  const { data, isLoading, refetch } = useGetUserPhotosQuery({});
  // Track previous states for upload & delete
  const prevIsUploadingRef = useRef(isUploading);
  const prevIsDeletingRef = useRef(isDeleting);

  // Refetch when refreshing, upload xong, hoặc delete xong
  useEffect(() => {
    let shouldRefetch = false;
    if (isRefreshing) shouldRefetch = true;
    if (prevIsUploadingRef.current && !isUploading) shouldRefetch = true;
    if (prevIsDeletingRef.current && !isDeleting) shouldRefetch = true;
    if (shouldRefetch) refetch();
    prevIsUploadingRef.current = isUploading;
    prevIsDeletingRef.current = isDeleting;
  }, [isRefreshing, isUploading, isDeleting, refetch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Photos</Text>
      <View style={styles.content}>
        <PhotoGrid
          photos={(data || []) as Photo[]}
          maxPhotos={6}
          isUploading={isLoading || isUploading}
          onAddPhoto={onAddPhoto}
          onDeletePhoto={onDeletePhoto}
          isDeleting={isDeleting}
          deletingPhotoId={deletingPhotoId}
        />
      </View>
    </View>
  );
};
